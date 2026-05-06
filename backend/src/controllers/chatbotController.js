const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Subject knowledge base with topics and explanations
const subjectData = {
  mathematics: {
    name: 'Mathematics',
    icon: '📐',
    topics: {
      algebra: {
        title: 'Algebra',
        content: `**Algebra** is a branch of mathematics that uses letters and symbols to represent numbers and quantities in formulas and equations.

**Key Concepts:**
• **Variables**: Letters like x, y, z that represent unknown values
• **Expressions**: Combinations of variables, numbers, and operations (e.g., 3x + 5)
• **Equations**: Statements that two expressions are equal (e.g., 2x + 3 = 7)
• **Linear Equations**: Equations where the highest power of the variable is 1

**Example:** Solve 2x + 3 = 11
→ 2x = 11 - 3 = 8
→ x = 8 ÷ 2 = 4

**Practice Tip:** Always perform the same operation on both sides of the equation!`,
        subtopics: ['linear equations', 'quadratic equations', 'polynomials', 'factoring']
      },
      geometry: {
        title: 'Geometry',
        content: `**Geometry** deals with shapes, sizes, positions, and properties of space.

**Key Formulas:**
• **Area of Rectangle** = length × width
• **Area of Triangle** = ½ × base × height
• **Area of Circle** = π × r²
• **Circumference of Circle** = 2πr
• **Pythagorean Theorem**: a² + b² = c² (for right triangles)

**Types of Angles:**
• Acute: < 90°
• Right: = 90°
• Obtuse: > 90° and < 180°
• Straight: = 180°

**Practice Tip:** Draw diagrams! Visual representation helps solve geometry problems.`,
        subtopics: ['triangles', 'circles', 'quadrilaterals', 'coordinate geometry']
      },
      trigonometry: {
        title: 'Trigonometry',
        content: `**Trigonometry** studies relationships between the sides and angles of triangles.

**Primary Ratios (SOH-CAH-TOA):**
• **sin θ** = Opposite / Hypotenuse
• **cos θ** = Adjacent / Hypotenuse
• **tan θ** = Opposite / Adjacent

**Important Values:**
| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 |
| 45° | 1/√2 | 1/√2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | ∞ |

**Identity:** sin²θ + cos²θ = 1`,
        subtopics: ['ratios', 'identities', 'heights and distances']
      },
      statistics: {
        title: 'Statistics',
        content: `**Statistics** is the study of collecting, analyzing, and interpreting data.

**Measures of Central Tendency:**
• **Mean** = Sum of all values ÷ Number of values
• **Median** = Middle value when arranged in order
• **Mode** = Most frequently occurring value

**Example:** Data: 2, 3, 5, 5, 7
• Mean = (2+3+5+5+7)/5 = 22/5 = 4.4
• Median = 5 (middle value)
• Mode = 5 (appears most)

**Standard Deviation** measures how spread out the data is from the mean.`,
        subtopics: ['mean', 'median', 'mode', 'probability']
      }
    }
  },
  science: {
    name: 'Science',
    icon: '🔬',
    topics: {
      physics: {
        title: 'Physics',
        content: `**Physics** is the study of matter, energy, and the fundamental forces of nature.

**Newton's Laws of Motion:**
1. **First Law (Inertia)**: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force
2. **Second Law**: F = ma (Force = Mass × Acceleration)
3. **Third Law**: Every action has an equal and opposite reaction

**Key Formulas:**
• Speed = Distance / Time
• Acceleration = Change in velocity / Time
• Work = Force × Distance
• Kinetic Energy = ½mv²
• Potential Energy = mgh`,
        subtopics: ['mechanics', 'thermodynamics', 'optics', 'electricity']
      },
      chemistry: {
        title: 'Chemistry',
        content: `**Chemistry** studies the composition, structure, and properties of matter.

**Periodic Table Basics:**
• Elements are arranged by atomic number
• Rows = Periods, Columns = Groups
• Metals (left), Non-metals (right), Metalloids (diagonal)

**Chemical Bonding:**
• **Ionic Bond**: Transfer of electrons (metal + non-metal)
• **Covalent Bond**: Sharing of electrons (non-metal + non-metal)

**Balancing Equations:**
• Count atoms on both sides
• Use coefficients to balance
• Example: 2H₂ + O₂ → 2H₂O

**pH Scale:** 0-14 (0 = strong acid, 7 = neutral, 14 = strong base)`,
        subtopics: ['atomic structure', 'chemical reactions', 'acids and bases', 'organic chemistry']
      },
      biology: {
        title: 'Biology',
        content: `**Biology** is the study of living organisms and their interactions.

**Cell Structure:**
• **Cell Membrane**: Controls what enters/exits the cell
• **Nucleus**: Contains DNA, controls cell activities
• **Mitochondria**: Powerhouse of the cell (produces ATP)
• **Chloroplast**: Site of photosynthesis (in plant cells)

**Photosynthesis:** 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂

**Respiration:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)

**DNA Structure:** Double helix with base pairs (A-T, G-C)`,
        subtopics: ['cell biology', 'genetics', 'ecology', 'human body']
      }
    }
  },
  english: {
    name: 'English',
    icon: '📚',
    topics: {
      grammar: {
        title: 'Grammar',
        content: `**Grammar** is the set of rules that governs the structure of language.

**Parts of Speech:**
• **Noun**: Person, place, thing (dog, city, idea)
• **Verb**: Action or state (run, is, think)
• **Adjective**: Describes a noun (big, beautiful, smart)
• **Adverb**: Describes a verb (quickly, very, well)
• **Pronoun**: Replaces a noun (he, she, they)

**Tenses:**
• **Present Simple**: I eat (habitual)
• **Past Simple**: I ate (completed)
• **Future Simple**: I will eat (upcoming)
• **Present Continuous**: I am eating (happening now)
• **Present Perfect**: I have eaten (past → present)

**Common Mistakes:**
• Their/There/They're
• Your/You're
• Its/It's
• Effect/Affect`,
        subtopics: ['tenses', 'parts of speech', 'punctuation', 'sentence structure']
      },
      writing: {
        title: 'Writing Skills',
        content: `**Writing Skills** help you express ideas clearly and effectively.

**Essay Structure:**
1. **Introduction**: Hook → Background → Thesis statement
2. **Body Paragraphs**: Topic sentence → Evidence → Analysis → Transition
3. **Conclusion**: Restate thesis → Summarize → Final thought

**Tips for Good Writing:**
• Use active voice: "The cat chased the mouse" ✓
• Avoid passive: "The mouse was chased by the cat" ✗
• Show, don't tell: "Her hands trembled" vs "She was scared"
• Use varied sentence lengths
• Proofread your work!

**Transition Words:** However, Moreover, Furthermore, In addition, Nevertheless, Consequently`,
        subtopics: ['essay writing', 'creative writing', 'letter writing', 'report writing']
      },
      literature: {
        title: 'Literature',
        content: `**Literature** is the art of written works.

**Literary Devices:**
• **Simile**: Comparison using "like" or "as" (fast as a cheetah)
• **Metaphor**: Direct comparison (the world is a stage)
• **Personification**: Giving human qualities to non-human things
• **Alliteration**: Repetition of consonant sounds (Peter Piper picked)
• **Hyperbole**: Exaggeration (I've told you a million times)
• **Irony**: Contrast between expectation and reality

**Types of Literature:**
• Poetry, Prose, Drama
• Fiction vs Non-fiction
• Genres: Mystery, Fantasy, Romance, Sci-Fi, Historical`,
        subtopics: ['poetry', 'prose', 'literary devices', 'comprehension']
      }
    }
  },
  hindi: {
    name: 'Hindi',
    icon: '📖',
    topics: {
      vyakaran: {
        title: 'व्याकरण (Grammar)',
        content: `**हिंदी व्याकरण** भाषा के नियमों का अध्ययन है।

**वर्ण विचार:**
• स्वर: अ, आ, इ, ई, उ, ऊ, ए, ऐ, ओ, औ
• व्यंजन: क, ख, ग, घ... (33 व्यंजन)

**संज्ञा (Noun):** किसी व्यक्ति, वस्तु, स्थान का नाम
• व्यक्तिवाचक: राम, दिल्ली
• जातिवाचक: लड़का, नदी
• भाववाचक: सुंदरता, ईमानदारी

**सर्वनाम (Pronoun):** संज्ञा के स्थान पर प्रयोग
मैं, तुम, वह, हम, तुम, वे

**क्रिया (Verb):** काम का होना या करना
खाना, पीना, सोना, पढ़ना`,
        subtopics: ['संज्ञा', 'सर्वनाम', 'क्रिया', 'विशेषण']
      },
      sahitya: {
        title: 'साहित्य (Literature)',
        content: `**हिंदी साहित्य** का समृद्ध इतिहास है।

**काव्य के भेद:**
• महाकाव्य
• खंडकाव्य
• मुक्तक काव्य

**प्रमुख कवि:**
• कबीरदास - दोहे
• तुलसीदास - रामचरितमानस
• सूरदास - सूरसागर
• मीराबाई - भक्ति गीत
• हरिवंश राय बच्चन - मधुशाला

**गद्य विधाएं:**
कहानी, उपन्यास, नाटक, निबंध, जीवनी`,
        subtopics: ['कविता', 'कहानी', 'निबंध', 'पत्र लेखन']
      }
    }
  },
  'social studies': {
    name: 'Social Studies',
    icon: '🌍',
    topics: {
      history: {
        title: 'History',
        content: `**History** is the study of past events and their impact on society.

**Ancient Civilizations:**
• Indus Valley Civilization (3300-1300 BCE)
• Egyptian Civilization
• Mesopotamian Civilization
• Chinese Civilization

**Medieval India:**
• Delhi Sultanate (1206-1526)
• Mughal Empire (1526-1857)
• Bhakti and Sufi Movements

**Modern India:**
• British East India Company (1600)
• Indian Independence Movement
• Key Leaders: Mahatma Gandhi, Nehru, Subhas Chandra Bose
• Independence: August 15, 1947
• Republic Day: January 26, 1950`,
        subtopics: ['ancient civilizations', 'medieval period', 'modern history', 'independence movement']
      },
      geography: {
        title: 'Geography',
        content: `**Geography** studies the Earth's landscapes, environments, and people.

**Types of Geography:**
• **Physical**: Landforms, climate, natural resources
• **Human**: Population, culture, urbanization

**India's Geography:**
• Area: 3.287 million km²
• States: 28 + 8 Union Territories
• Mountain Ranges: Himalayas, Western/Eastern Ghats
• Rivers: Ganga, Yamuna, Brahmaputra, Godavari
• Climate Zones: Tropical, Subtropical, Arid, Alpine

**Important Concepts:**
• Latitude & Longitude
• Time Zones
• Seasons and their causes
• Water cycle
• Types of soil`,
        subtopics: ['physical geography', 'human geography', 'map skills', 'climate']
      },
      civics: {
        title: 'Civics',
        content: `**Civics** studies the rights and duties of citizens and government.

**Indian Constitution:**
• Adopted: November 26, 1949
• Enacted: January 26, 1950
• Written by: Dr. B.R. Ambedkar (Chairman of Drafting Committee)

**Fundamental Rights (Part III):**
1. Right to Equality
2. Right to Freedom
3. Right against Exploitation
4. Right to Freedom of Religion
5. Cultural and Educational Rights
6. Right to Constitutional Remedies

**Three Pillars of Democracy:**
• Legislature (Parliament) - Makes laws
• Executive (President + PM) - Implements laws
• Judiciary (Supreme Court) - Interprets laws`,
        subtopics: ['constitution', 'democracy', 'government', 'fundamental rights']
      }
    }
  }
};

// Generate a smart response based on user input
const generateResponse = (message, subject) => {
  const lowerMsg = message.toLowerCase().trim();

  // Check if user is asking for a list of subjects
  if (lowerMsg.includes('subjects') || lowerMsg.includes('what can') || lowerMsg === 'help') {
    const subjectList = Object.entries(subjectData)
      .map(([key, val]) => `${val.icon} **${val.name}**`)
      .join('\n');
    return {
      content: `I can help you learn these subjects:\n\n${subjectList}\n\nJust type a subject name or ask me any question! For example:\n• "Teach me algebra"\n• "What is photosynthesis?"\n• "Explain Newton's laws"`,
      suggestions: Object.keys(subjectData)
    };
  }

  // If a subject is selected, search within it
  if (subject && subjectData[subject]) {
    const subjectInfo = subjectData[subject];
    for (const [key, topic] of Object.entries(subjectInfo.topics)) {
      if (lowerMsg.includes(key) || lowerMsg.includes(topic.title.toLowerCase())) {
        return {
          content: topic.content,
          suggestions: topic.subtopics,
          topic: topic.title
        };
      }
      // Check subtopics
      for (const st of topic.subtopics) {
        if (lowerMsg.includes(st.toLowerCase())) {
          return {
            content: topic.content,
            suggestions: topic.subtopics,
            topic: topic.title
          };
        }
      }
    }
    // If no specific topic matched, show available topics
    const topicList = Object.entries(subjectInfo.topics)
      .map(([key, val]) => `• **${val.title}**`)
      .join('\n');
    return {
      content: `${subjectInfo.icon} **${subjectInfo.name}** — Available Topics:\n\n${topicList}\n\nClick on a topic or type its name to learn more!`,
      suggestions: Object.keys(subjectInfo.topics)
    };
  }

  // Search across all subjects
  for (const [subjectKey, subjectInfo] of Object.entries(subjectData)) {
    // Check subject name
    if (lowerMsg.includes(subjectKey) || lowerMsg.includes(subjectInfo.name.toLowerCase())) {
      const topicList = Object.entries(subjectInfo.topics)
        .map(([key, val]) => `• **${val.title}**`)
        .join('\n');
      return {
        content: `${subjectInfo.icon} **${subjectInfo.name}** — Available Topics:\n\n${topicList}\n\nClick on a topic or type its name to learn more!`,
        suggestions: Object.keys(subjectInfo.topics),
        detectedSubject: subjectKey
      };
    }

    // Search topics
    for (const [topicKey, topic] of Object.entries(subjectInfo.topics)) {
      if (lowerMsg.includes(topicKey) || lowerMsg.includes(topic.title.toLowerCase())) {
        return {
          content: topic.content,
          suggestions: topic.subtopics,
          topic: topic.title,
          detectedSubject: subjectKey
        };
      }
      // Search subtopics
      for (const st of topic.subtopics) {
        if (lowerMsg.includes(st.toLowerCase())) {
          return {
            content: topic.content,
            suggestions: topic.subtopics,
            topic: topic.title,
            detectedSubject: subjectKey
          };
        }
      }
    }
  }

  // Keyword-based responses
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      content: `👋 Hello! I'm your **EduManage Study Buddy**!\n\nI can help you learn various subjects. Just ask me about:\n\n📐 **Mathematics** — Algebra, Geometry, Trigonometry, Statistics\n🔬 **Science** — Physics, Chemistry, Biology\n📚 **English** — Grammar, Writing, Literature\n📖 **Hindi** — व्याकरण, साहित्य\n🌍 **Social Studies** — History, Geography, Civics\n\nWhat would you like to learn today?`,
      suggestions: Object.keys(subjectData)
    };
  }

  if (lowerMsg.includes('thank')) {
    return {
      content: `You're welcome! 😊 Keep learning and stay curious!\n\nWant to explore another topic? Just type a subject name or ask a question!`,
      suggestions: Object.keys(subjectData)
    };
  }

  if (lowerMsg.includes('quiz') || lowerMsg.includes('test') || lowerMsg.includes('practice')) {
    return {
      content: `🎯 **Quick Practice Tips:**\n\n1. **Review** the topic first\n2. **Solve** practice problems\n3. **Time yourself** to build speed\n4. **Revise** mistakes\n\nWhich subject would you like to practice?\nType a subject name to see the topics available!`,
      suggestions: Object.keys(subjectData)
    };
  }

  // Default response
  return {
    content: `I'm not sure about that specific topic, but I can help you with:\n\n📐 **Mathematics** — Algebra, Geometry, Trigonometry, Statistics\n🔬 **Science** — Physics, Chemistry, Biology\n📚 **English** — Grammar, Writing, Literature\n📖 **Hindi** — व्याकरण, साहित्य\n🌍 **Social Studies** — History, Geography, Civics\n\nTry asking:\n• "Teach me algebra"\n• "Explain photosynthesis"\n• "What are Newton's laws?"`,
    suggestions: Object.keys(subjectData)
  };
};

// @desc    Chat with the study bot
// @route   POST /api/chatbot/message
// @access  Private (Student)
exports.sendChatMessage = async (req, res, next) => {
  try {
    const { message, subject } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    let reply = '';
    let suggestions = [];
    let topic = null;
    let detectedSubject = subject;

    // Try Gemini AI first if key is available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "You are EduManage Study Buddy, an AI learning assistant for school students. Help them understand concepts in Mathematics, Science, English, Hindi, and Social Studies. Use Markdown for formatting. Keep answers concise and educational." }],
            },
            {
              role: "model",
              parts: [{ text: "Hello! I am EduManage Study Buddy. I'm ready to help students learn and understand their school subjects. How can I assist you today?" }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
          },
        });

        const prompt = subject ? `[Subject: ${subject}] ${message}` : message;
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        reply = response.text();
        
        // Basic suggestions based on the reply
        suggestions = ['Explain more', 'Give an example', 'Practice question'];
      } catch (aiErr) {
        console.error('Gemini AI Error:', aiErr.message);
        // Fallback to static response if AI fails
        const fallback = generateResponse(message, subject);
        reply = fallback.content;
        suggestions = fallback.suggestions || [];
        topic = fallback.topic || null;
        detectedSubject = fallback.detectedSubject || subject;
      }
    } else {
      // Use static knowledge base if no AI key
      const response = generateResponse(message, subject);
      reply = response.content;
      suggestions = response.suggestions || [];
      topic = response.topic || null;
      detectedSubject = response.detectedSubject || subject;
    }

    res.status(200).json({
      success: true,
      data: {
        reply,
        suggestions,
        topic,
        detectedSubject: detectedSubject || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available subjects
// @route   GET /api/chatbot/subjects
// @access  Private (Student)
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = Object.entries(subjectData).map(([key, val]) => ({
      key,
      name: val.name,
      icon: val.icon,
      topicCount: Object.keys(val.topics).length,
      topics: Object.entries(val.topics).map(([tKey, tVal]) => ({
        key: tKey,
        title: tVal.title,
        subtopics: tVal.subtopics,
      })),
    }));

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (err) {
    next(err);
  }
};
