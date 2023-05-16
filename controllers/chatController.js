import { tryCatch } from '../utils/tryCatch.js';
import { Chat } from '../models/chat.js';
import { getUsers, io } from '../index.js';

export const getUserAllChats = tryCatch(async (req, res) => {
    const { userId } = req.params;
    const existingChat = await Chat.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).populate('sender').populate('receiver')

    if (!existingChat) {
        return res.status(201).json([]);
    }

    const chatsWithLastMessage = existingChat.map(chat => {
        const lastMessage = chat.messages.length > 0 ? chat.messages.pop() : null; // Get the first message (latest) from the messages array

        // Determine the role based on userId
        const role = userId === chat.sender._id.toString() ? 'sender' : 'receiver';

        return {
            ...chat._doc,
            role, // Add the role field to the chat object
            messages: [lastMessage] // Replace the messages array with only the lastMessage
        };
    });

    res.status(201).json(chatsWithLastMessage);
});

export const getUserUnreadChats = tryCatch(async (req, res) => {
    const { userId } = req.params;
    const existingChat = await Chat.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).populate('sender').populate('receiver')

    if (!existingChat) {
        return res.status(201).json([]);
    }

    let unReadMessages = 0
    existingChat.forEach(chat => {
        if (chat.messages.length > 0) {
            for (let i = chat.messages.length - 1; i >= 0; i--) {
                const val = chat.messages[i];
                if (val.sender.toString() !== userId) {
                    if (!val.read) {
                        unReadMessages++;
                    }
                    break; // exit the loop once you find the first unread message
                }
            }
        }
    });
    res.status(201).json({ unReadMessages: unReadMessages });
});


export const newMessage = tryCatch(async (req, res) => {
    const { user1, user2, senderId, text, type, date, time } = req.body;

    // Check if chat already exists between sender and receiver
    const existingChat = await Chat.findOne({
        $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }
        ]
    });

    if (existingChat) {
        // Chat already exists, push new message into messages array
        existingChat.messages.push({
            content: text,
            sender: senderId,
            date: date,
            time: time,
            read: false,
            type: type
        });

        await existingChat.save();

        // Emit 'refetchChat' event to receiver's socketId
        const receiver = getUsers(user2);
        if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit('refetchMessageRead');
            io.to(receiver.socketId).emit('refetchChat', { chatId: existingChat._id });
        }

        res.status(200).json({ message: 'Message sent successfully' });
    } else {
        // Chat doesn't exist, create new chat entry and push new message into messages array
        const newChat = new Chat({
            sender: user1,
            receiver: user2,
            messages: [{
                content: text,
                sender: senderId,
                date: date,
                time: time,
                read: false,
                type: type
            }]
        });

        await newChat.save();

        // Emit 'refetchChat' event to receiver's socketId
        const receiver = getUsers(user2);
        if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit('refetchMessageRead');
            io.to(receiver.socketId).emit('refetchChat', { chatId: newChat._id });
        }
        res.status(200).json({ message: 'Message sent successfully' });
    }
});


export const messageRead = tryCatch(async (req, res) => {
    const { chatId, userId } = req.body;

    // Find the chat by chatId and populate the sender and receiver fields
    const chat = await Chat.findById(chatId).populate("sender").populate("receiver");

    // Loop through the messages in the chat
    chat.messages.forEach(async (message) => {
        // If the sender of the message is not the current user (userId) and the read property is false,
        // set read to true
        if (message.sender.toString() !== userId && !message.read) {
            message.read = true;
        }
    });

    // Save the updated chat
    await chat.save();

    res.status(200).json({ success: true, message: "Messages marked as read" });
});

export const singleChat = tryCatch(async (req, res) => {
    const { user1, user2 } = req.params;

    const existingChat = await Chat.findOne({
        $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }
        ]
    });

    if (existingChat) {
        return res.status(201).json(existingChat);
    }

    res.status(201).json([]);
});