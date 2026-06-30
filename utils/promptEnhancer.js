const RULES_DETAILED = `Create comprehensive server rules. Include:
1) General conduct and respect
2) No harassment, hate speech, or discrimination
3) No spam, advertising, or self-promotion
4) Voice chat etiquette
5) Appropriate channels for content
6) Punishment guidelines (warnings → mute → kick → ban)
7) How to report issues to staff
Format with emojis and clear section headers.`;

const WELCOME_DETAILED = `Create a warm welcome message for new members. Include:
1) Greeting and thank you for joining
2) Brief intro to what the server offers
3) Reminder to check rules
4) How to get roles and introduce themselves
5) Link to key channels
Use emojis and friendly tone.`;

const ANNOUNCEMENT_DETAILED = `Write a clear announcement. Include:
1) Attention-grabbing header
2) What the announcement is about
3) Key details and dates
4) Call to action if needed
5) Footer with contact info
Keep it professional and use formatting.`;

const SETUP_ADVICE_DETAILED = `The user wants help setting up their server. Give detailed advice covering:
1) Recommended channel structure (categories and channels for different purposes)
2) Essential roles and permissions
3) Moderation and security best practices
4) Bots and integrations they should consider
5) Tips for growing their community
Be thorough and practical.`;

const rules = [
  { pattern: /\b(?:make|create|write|generate)\s+(?:server\s+)?(?:rules?|guidelines?)\b/i, enhance: RULES_DETAILED },
  { pattern: /\b(?:welcome|greeting)\s+(?:message|msg|text|card|page)\b/i, enhance: WELCOME_DETAILED },
  { pattern: /\b(?:make|create|write|send)\s+(?:an?\s+)?announcement\b/i, enhance: ANNOUNCEMENT_DETAILED },
  { pattern: /\b(?:how\s+(?:do|should|can)\s+I\s+(?:set\s+up|setup|configure|organize))\b/i, enhance: SETUP_ADVICE_DETAILED },
  { pattern: /\b(?:what\s+(?:channels?|roles?)\s+(?:should|do)\s+(?:I|we)\s+(?:have|need|make))\b/i, enhance: SETUP_ADVICE_DETAILED },
  { pattern: /\b(?:recommend|suggest)\s+(?:me\s+)?(?:some\s+)?(?:channels?|roles?|bots?)\b/i, enhance: SETUP_ADVICE_DETAILED },
];

export function enhancePrompt(text) {
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      return `${text}\n\n${rule.enhance}`;
    }
  }
  return text;
}
