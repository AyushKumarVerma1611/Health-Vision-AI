const Chat = require('../models/Chat');

const createOrUpdateSession = async (req, res, next) => {
  try {
    const { sessionId, title, messages } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    let chat = await Chat.findOne({ sessionId, userId: req.user._id });

    if (chat) {
      if (title) chat.title = title;
      if (messages && Array.isArray(messages)) {
        chat.messages = messages;
      }
      await chat.save();
    } else {
      chat = await Chat.create({
        userId: req.user._id,
        sessionId,
        title: title || 'New Conversation',
        messages: messages || [],
      });
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('sessionId title messages createdAt updatedAt')
      .lean();

    const sessions = chats.map((chat) => ({
      _id: chat._id,
      sessionId: chat.sessionId,
      title: chat.title,
      messageCount: chat.messages.length,
      firstMessage: chat.messages.length > 0 ? chat.messages[0].content.substring(0, 100) : '',
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    res.json({ message: 'Chat session deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateSession,
  getSessions,
  getSession,
  deleteSession,
};
