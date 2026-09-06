import express from 'express';

import Chat from '../models/chat.model.js';
import Property from '../models/property.model.js';
import User from '../models/user.model.js';
import { protect } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.use(protect);

// Start or get chat
chatRouter.post('/start', async (req, res) => {
  try {
    const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;

    let buyerId;
    let finalSellerId;

    if (req.user.role === 'seller') {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else if (req.user.role === 'buyer') {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    } else {
      return res.status(403).json({ message: 'Only buyers and sellers can start chats' });
    }

    if (!buyerId || !finalSellerId) {
      return res.status(400).json({ message: 'Missing buyer or seller ID' });
    }

    if (buyerId.toString() === finalSellerId.toString()) {
      return res.status(400).json({ message: 'A user cannot chat with themselves' });
    }

    if (req.user.role === 'seller') {
      const buyer = await User.findOne({ _id: buyerId, role: 'buyer' });
      if (!buyer) {
        return res.status(400).json({ message: 'Buyer not found' });
      }
    } else {
      const seller = await User.findOne({
        _id: finalSellerId,
        role: 'seller',
        isApproved: true,
      });
      if (!seller) {
        return res.status(400).json({ message: 'Approved seller not found' });
      }
    }

    if (propertyId) {
      const property = await Property.findOne({
        _id: propertyId,
        seller: finalSellerId,
      });
      if (!property) {
        return res.status(400).json({ message: 'Property not found for this seller' });
      }
    }

    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: finalSellerId,
    });

    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        buyer: buyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    chat = await Chat.findById(chat._id)
      .populate('buyer', 'name email profilePic')
      .populate('seller', 'name email profilePic')
      .populate('property', 'title price images');

    return res.json(chat);
  } catch (err) {
    return res.status(500).json({
      message: 'Error creating or getting the chat',
      error: err.message,
    });
  }
});

// Send a message
chatRouter.post('/send', async (req, res) => {
  try {
    const { chatId, text, image } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (
      chat.buyer.toString() !== userId &&
      chat.seller.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const newMessage = {
      sender: userId,
      text: text.trim(),
      image: typeof image === 'string' && image.trim() ? image : undefined,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    return res.json({ chat, newMessage: savedMessage });
  } catch (err) {
    return res.status(500).json({
      message: 'Error sending the message',
      error: err.message,
    });
  }
});

// Get user chats
chatRouter.get('/user', async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('buyer', 'name email profilePic')
      .populate('seller', 'name email profilePic')
      .populate('property', 'title price images')
      .sort({ updatedAt: -1 });

    return res.json(chats);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching user's chats",
      error: err.message,
    });
  }
});

// Get single chat by ID
chatRouter.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      'messages.sender',
      'name profilePic'
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const userId = req.user._id.toString();

    if (
      chat.buyer.toString() !== userId &&
      chat.seller.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json(chat);
  } catch (err) {
    return res.status(500).json({
      message: 'Error fetching chat messages',
      error: err.message,
    });
  }
});

// Delete entire chat
chatRouter.delete('/:chatId', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (
      chat.buyer.toString() !== userId &&
      chat.seller.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Chat.findByIdAndDelete(req.params.chatId);

    return res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    return res.status(500).json({
      message: 'Error deleting chat',
      error: err.message,
    });
  }
});

// Delete specific message
chatRouter.delete('/:chatId/message/:messageId', async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id.toString();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to delete this message',
      });
    }

    chat.messages.pull(messageId);
    await chat.save();

    return res.json({
      message: 'Message deleted successfully',
      chat,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error deleting message',
      error: err.message,
    });
  }
});

export default chatRouter;