import axios from 'axios';

export class SlackService {
  /**
   * Sends a notification to a Slack channel via Webhook URL
   */
  static async sendNotification(webhookUrl: string, blocks: any[], fallbackText: string) {
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, {
        text: fallbackText,
        blocks: [
          ...blocks,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "✨ *Sent via Speclane Dashboard*"
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Slack Notification Error:', error);
    }
  }

  static async notifyTestGenerated(webhookUrl: string, projectName: string, count: number) {
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: "🚀 Generation Success", emoji: true }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Project:* ${projectName}\n*Status:* Completed Successfully\n*Test Cases:* ${count} new cases generated.`
        },
        accessory: {
          type: "image",
          image_url: "https://img.icons8.com/fluency/96/ok--v1.png",
          alt_text: "success"
        }
      },
      { type: "divider" }
    ];

    return this.sendNotification(webhookUrl, blocks, `Tests generated for ${projectName}`);
  }

  static async notifyDefectReported(webhookUrl: string, projectName: string, defectTitle: string, severity: string) {
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: "⚠️ New Defect Alert", emoji: true }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Project:*\n${projectName}` },
          { type: "mrkdwn", text: `*Severity:*\n${severity}` }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Defect Title:*\n${defectTitle}`
        }
      },
      { type: "divider" }
    ];

    return this.sendNotification(webhookUrl, blocks, `New defect in ${projectName}`);
  }
}
