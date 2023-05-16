import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

export const Option = mongoose.model('Option', optionSchema);
