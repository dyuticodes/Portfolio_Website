'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { profile } from '@/lib/content';

export default function ContactForm() {
  const [prepared, setPrepared] = useState(false);

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const subject = `Portfolio enquiry from ${name}`;
    const body = `${message}\n\nFrom: ${name}\nReply to: ${email}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }

  return <form className="contact-form" onSubmit={prepareEmail} aria-labelledby="message-heading">
    <h3 id="message-heading">Send a Message</h3>
    <div className="contact-form-row">
      <label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" placeholder="Your name" required maxLength={100}/></label>
      <label htmlFor="contact-email">Your email<input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></label>
    </div>
    <label htmlFor="contact-message">Your message<textarea id="contact-message" name="message" placeholder="Tell me what you have in mind…" required rows={4} maxLength={3000}/></label>
    <div className="contact-form-footer">
      <button className="button contact-send" type="submit" aria-describedby="email-help">Send email <Send size={19}/></button>
    </div>
    <p className="contact-form-status" role="status">{prepared && 'Your email draft is ready to open. If no email app opened, use the Email link to get in touch.'}</p>
  </form>;
}
