import { NextRequest, NextResponse } from 'next/server';

/**
 * External Webhook Dispatcher for PAI Reflections
 * Dispatches structured reflection summaries and action items to Slack or Discord webhooks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, summary, actionItems = [], webhookUrl, platform = 'slack' } = body;

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return NextResponse.json(
        { error: 'A valid webhookUrl is required.' },
        { status: 400 }
      );
    }

    // Prepare platform-specific webhook payload
    const payload =
      platform === 'slack'
        ? {
            text: `*PAI Reflection Summary: ${title || 'Untitled'}*\n${summary || 'No summary provided.'}\n\n*Action Items:*\n${
              actionItems.length > 0
                ? actionItems.map((item: string) => `• ${item}`).join('\n')
                : '• No action items identified'
            }`,
          }
        : {
            content: `**PAI Reflection: ${title || 'Untitled'}**\n${summary || 'No summary provided.'}`,
          };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      delivered: res.ok,
      status: res.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch external notification webhook.' },
      { status: 500 }
    );
  }
}
