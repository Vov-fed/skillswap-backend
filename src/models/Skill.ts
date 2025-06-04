import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  skillOffered: {
    type: String,
    required: true,
  },
  skillRequested: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  userOffering: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usersRequesting: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  usersInterested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.model('Skill', SkillSchema);