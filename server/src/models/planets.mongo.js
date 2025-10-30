import mongoose from 'mongoose';

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Planet', planetSchema)
