import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini-fallback';

export async function POST(req: NextRequest) {
  try {
    // Top-Level Request Deserialization & Defensive Payload Ingestion
    const body = await req.json().catch(() => ({}));
    const data = (body && typeof body === 'object') ? body : {};

    const {
      action = 'chat',
      messages = [],
      prompt = '',
      context = '',
      category = 'reflection',
      summaryType = 'structured',
    } = data;

    // Validate minimum required inputs
    if (action === 'chat' && (!Array.isArray(messages) || messages.length === 0) && !prompt) {
      return NextResponse.json(
        { error: 'A user prompt or conversation message history is required.' },
        { status: 400 }
      );
    }

    if ((action === 'summarize' || action === 'brainstorm' || action === 'title') && !prompt && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: 'Context or messages are required to generate summaries or brainstorms.' },
        { status: 400 }
      );
    }

    let systemInstruction = '';
    let contents: any = [];

    if (action === 'chat') {
      systemInstruction = `You are ReflectAI, an empathetic, insightful, and thoughtful reflection partner and journaling companion.
Your goal is to help the user unpack their thoughts, feelings, plans, and experiences.
Follow these principles:
- Validate the user's perspective while offering constructive and gentle reframing where helpful.
- Ask 1 or 2 targeted, deep follow-up questions to encourage further introspection.
- Keep answers clear, beautifully structured, using bold headings or bullet points where appropriate.
- Avoid robotic cliches. Speak with warm, grounded, and intellectual clarity.`;

      // Build conversation history for Gemini multi-turn format
      const formattedHistory: any[] = [];
      
      if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
          if (msg && typeof msg === 'object' && msg.content) {
            formattedHistory.push({
              role: msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: String(msg.content) }],
            });
          }
        }
      }

      if (prompt) {
        formattedHistory.push({
          role: 'user',
          parts: [{ text: String(prompt) }],
        });
      }

      contents = formattedHistory;
    } else if (action === 'summarize') {
      const textToSummarize = prompt || messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

      if (summaryType === 'brief') {
        systemInstruction = `You are an expert cognitive synthesizer.
Distill the user's reflection into a high-impact, elegant **Brief Summary** (2-3 concise sentences).
Focus on:
1. The primary emotional state or core dilemma.
2. The central realization or breakthrough.
Format your output strictly in Markdown under a single heading: ### 📝 Brief Summary`;

        contents = [
          {
            role: 'user',
            parts: [{ text: `Generate a concise 2-3 sentence brief summary of this reflection session:\n\n${textToSummarize}` }],
          },
        ];
      } else if (summaryType === 'takeaways') {
        systemInstruction = `You are an analytical reflection coach.
Extract the core **Key Takeaways & Core Lessons** from the user's journal entry / reflection.
Format your output in clean Markdown with:
### 💡 Key Takeaways & Realizations
- **(Theme 1)**: (Clear explanation of the insight or pattern observed)
- **(Theme 2)**: (Underlying driver or cognitive shift)
- **(Theme 3)**: (Personal value or boundary clarified)
- **(Theme 4)**: (Perspective on how to view the situation moving forward)
Keep points punchy, thought-provoking, and deeply grounded in what was shared.`;

        contents = [
          {
            role: 'user',
            parts: [{ text: `Extract the pivotal key takeaways and cognitive realizations from this reflection:\n\n${textToSummarize}` }],
          },
        ];
      } else if (summaryType === 'actionable') {
        systemInstruction = `You are a practical action-oriented executive coach and mindfulness guide.
Translate the user's reflection into high-leverage **Actionable Insights & Next Steps**.
Format your output in clean Markdown with:
### 🚀 Actionable Insights & Next Steps
- [ ] **(Immediate Step / Today)**: (Specific, practical micro-action to take)
- [ ] **(Behavioral Adjustment)**: (Habit tweak or reaction pattern to watch for)
- [ ] **(Mindset Anchor)**: (Daily grounding practice or phrase to recall)
- [ ] **(Follow-up Reflection)**: (Question to check in on tomorrow or next week)
Make each item concrete, measurable, and realistically achievable.`;

        contents = [
          {
            role: 'user',
            parts: [{ text: `Generate actionable next steps, practical insights, and concrete follow-up items from this reflection:\n\n${textToSummarize}` }],
          },
        ];
      } else {
        // Default structured synthesis
        systemInstruction = `You are an expert analytical synthesizer and cognitive coach.
Analyze the provided journal entry / reflection and generate a high-clarity structured breakdown.
Format your output strictly in Markdown with these exact sections:

### 📝 Executive Summary
(A concise 2-3 sentence distillation of the main theme and emotional state)

### 💡 Core Insights & Key Takeaways
- (Bullet point 1: Key realization or underlying pattern)
- (Bullet point 2: Underlying driver or observation)
- (Bullet point 3: Shift in perspective)

### 🚀 Concrete Next Steps & Actionable Insights
- [ ] (Clear, actionable task or self-care step)
- [ ] (Follow-up habit or question to explore tomorrow)`;

        contents = [
          {
            role: 'user',
            parts: [{ text: `Please synthesize and summarize this reflection session with structured takeaways and action items:\n\n${textToSummarize}` }],
          },
        ];
      }
    } else if (action === 'brainstorm') {
      systemInstruction = `You are a creative strategist and lateral thinking advisor.
Review the user's reflection topic or challenge, and generate 4-5 diverse angles, counter-intuitive perspectives, and exploratory questions to push their thinking further. Use clean Markdown bullet points.`;

      const topic = prompt || messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
      contents = [
        {
          role: 'user',
          parts: [{ text: `Brainstorm new ideas and perspectives on this entry:\n\n${topic}` }],
        },
      ];
    } else if (action === 'title') {
      systemInstruction = `You are a headline generator. Based on the user's reflection or journal thoughts, generate a short, evocative 3-6 word title. Return ONLY the plain text title without quotation marks, colons, or punctuation.`;
      
      const sample = prompt || (Array.isArray(messages) && messages[0]?.content ? messages[0].content : 'Daily Reflection');
      contents = [
        {
          role: 'user',
          parts: [{ text: `Create a brief 3 to 6 word title for this:\n${sample}` }],
        },
      ];
    }

    const result = await generateContentWithFallback({
      systemInstruction,
      contents,
      temperature: action === 'brainstorm' ? 0.85 : 0.65,
    });

    return NextResponse.json({
      success: true,
      text: result.text.trim(),
      modelUsed: result.modelUsed,
      attemptedModels: result.attemptedModels,
      action,
    });
  } catch (error: any) {
    console.error('API /api/gemini/reflection error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'An error occurred while generating reflection insights.',
      },
      { status: 500 }
    );
  }
}
