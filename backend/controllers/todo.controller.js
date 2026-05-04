const { redisClient } = require('../config/redis');

const clearCache = async (user_id) => {
  try {
    const keys = await redisClient.keys(`todos:${user_id}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache clear error', err);
  }
};

const TodoController = {
  createTodo: async (req, res) => {
    const user_id = req.sub;
    const { text, date } = req.body;
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.create({
        text: text,
        date: date,
        completed: false,
        user_id: user_id
      });
      await clearCache(user_id);
      return res.status(201).json(result);
    } catch (error) {
      console.error('ADD TODO: ', error);
      return res.status(500).send();
    }
  },
  getAllTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;

    try {
      const cacheKey = `todos:${user_id}`;
      const cachedTodos = await redisClient.get(cacheKey);
      if (cachedTodos) {
        return res.status(200).json(JSON.parse(cachedTodos));
      }

      const result = await Todo.find({ user_id: user_id }).sort({ date: 1 }).select('-user_id');

      if (result && result.length > 0) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
        return res.status(200).json(result);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error('GET ALL TODO: ', error);
      return res.status(500).send();
    }
  },
  editTodo: async (req, res) => {
    const user_id = req.sub;
    const query = { _id: req.params.id, user_id: user_id };
    const data = req.body;
    const { Todo } = req.app.locals.models;

    try {
      const result = await Todo.findOne(query);
      if (result) {
        result.completed = data.completed !== undefined ? data.completed : result.completed;
        result.text = data.text ? data.text : result.text;
        result.date = data.date ? data.date : result.date;
        await result.save();
        await clearCache(user_id);
        return res.status(200).json(result);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error('UPDATE TODO: ', error);
      return res.status(500).send();
    }
  },
  deleteTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    const query = { _id: todo_id, user_id: user_id };
    const { Todo } = req.app.locals.models;

    try {
      await Todo.deleteOne(query);
      await clearCache(user_id);
      return res.status(200).json({ id: todo_id });
    } catch (error) {
      console.error('DELETE TODO: ', error);
      return res.status(500).send();
    }
  },
  getSearchTodo: async (req, res) => {
    const user_id = req.sub;
    const query = req.query.q;
    const { Todo } = req.app.locals.models;

    try {
      const cacheKeySearch = `todos:${user_id}:search:${query}`;
      const cachedSearch = await redisClient.get(cacheKeySearch);
      if (cachedSearch) {
        return res.status(200).json(JSON.parse(cachedSearch));
      }

      const result = await Todo.find({
        user_id: user_id,
        $text: { $search: query }
      })
        .sort({ date: 1 })
        .select('-user_id');

      if (result && result.length > 0) {
        await redisClient.setEx(cacheKeySearch, 3600, JSON.stringify(result));
        return res.status(200).json(result);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error('SEARCH TODO: ', error);
      return res.status(500).send();
    }
  }
};

module.exports = TodoController;
