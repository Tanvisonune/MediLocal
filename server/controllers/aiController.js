const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: 'Please describe your symptoms' });
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // free model
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical assistant in India. 
          Based on symptoms, suggest:
          1. What type of doctor/specialist to visit
          2. Possible condition (general, not diagnosis)
          3. Urgency level: Low / Medium / High
          4. Basic home care tips
          Keep response short, clear and in simple English.
          Always end with: "Please consult a doctor for proper diagnosis."`
        },
        {
          role: 'user',
          content: `My symptoms are: ${symptoms}`
        }
      ],
      max_tokens: 300
    });

    const advice = response.choices[0].message.content;

    res.json({
      symptoms,
      advice,
      disclaimer: 'This is AI-generated information only, not a medical diagnosis.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};