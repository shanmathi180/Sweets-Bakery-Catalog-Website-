import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  }

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', value: '123 Bakery Lane, Food District, Thanjavur 613 001' },
    { icon: Phone, title: 'Call Us', value: '+91 00000000' },
    { icon: Mail, title: 'Email Us', value: 'hello@shansbakery.com' },
    { icon: Clock, title: 'Hours', value: 'Mon–Sun: 8 AM – 10 PM' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-brand-50 via-cream-50 to-accent-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
          <h1 className="font-display text-4xl font-bold text-neutral-900 mt-3">Get in Touch</h1>
          <p className="text-neutral-600 mt-2">We'd love to hear from you. Reach out with any questions or custom orders.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, i) => (
                <div key={i} className="card p-5">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                    <info.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-900">{info.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{info.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1517433670267-08711f3a7bff?w=800&q=80"
                alt="Bakery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Contact form */}
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h2 className="font-display text-xl font-bold text-neutral-900">Send a Message</h2>
            </div>

            {submitted && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                Thank you for your message! We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Custom cake enquiry"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Message</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you need..."
                  className="input-field min-h-[120px]"
                />
              </div>
              <button type="submit" className="w-full btn-primary text-base py-3.5">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
