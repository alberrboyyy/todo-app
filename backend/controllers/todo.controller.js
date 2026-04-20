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
      const result = await Todo.find({ user_id: user_id }).sort({ date: 1 }).select('-user_id');

      if (result && result.length > 0) {
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
      const result = await Todo.find({
        user_id: user_id,
        $text: { $search: query }
      })
        .sort({ date: 1 })
        .select('-user_id');

      if (result && result.length > 0) {
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
