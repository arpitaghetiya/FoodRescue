import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Inquiry Submitted', 'Our operations team will follow up within 2 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mint text-forest border border-[#B7E4C7] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-freshgreen" />
            <span>Support & Operations • Indian Demo Operations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-forest tracking-tight">
            Contact FoodRescue Operations
          </h1>
          <p className="text-sm text-darktext/70 max-w-xl mx-auto">
            Questions regarding NGO onboarding, food safety policies, or partnership inquiries? Reach out to our engineering and support team.
          </p>
        </div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
        >
          {/* Info Card */}
          <div className="md:col-span-5 bg-forest text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-soft-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-freshgreen/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-extrabold text-white">Operations Coordinates</h3>
              <p className="text-xs text-mint/80 font-normal leading-relaxed">
                Our support desk is available Monday through Sunday for real-time surplus dispatch inquiries.
              </p>
            </div>

            <div className="relative z-10 space-y-4 text-xs sm:text-sm text-mint">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-freshgreen mt-0.5 shrink-0" />
                <span className="text-white">Department of Software Engineering, Tech Campus, Bengaluru, Karnataka 560100, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-freshgreen shrink-0" />
                <span className="text-white">support@foodrescue.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-freshgreen shrink-0" />
                <span className="text-white">+91 80 2555 0199</span>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-darkgreen text-xs text-mint/80 font-normal">
              <p className="font-bold text-white">Regional Coordinator Helpline:</p>
              <p className="mt-1">For urgent donation collection inquiries during dispatch hours: <span className="text-freshgreen font-semibold">+91 98765 43210</span></p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-surface-200 shadow-soft-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-mint text-forest flex items-center justify-center mx-auto shadow-soft">
                  <CheckCircle2 className="w-7 h-7 text-freshgreen" />
                </div>
                <h3 className="text-xl font-extrabold text-forest">Inquiry Delivered</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out, {name}. A member of the FoodRescue support team will follow up at {email} promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 text-xs font-bold text-mint bg-forest rounded-xl hover:bg-darkgreen shadow-soft"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-darktext mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-darktext mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="priya@organization.org"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-darktext mb-1.5">
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="NGO Verification / Food Donation Inquiry"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-darktext mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="How can our operations team assist your food business or charity organization?"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-forest hover:bg-darkgreen shadow-soft-lg hover:shadow-soft-xl transition-all flex items-center justify-center text-sm active:scale-95 group"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                  Transmit Inquiry
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
