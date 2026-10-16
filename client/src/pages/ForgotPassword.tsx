import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button.js';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-vastra-border rounded-sm p-8 shadow-xs">
        <div className="text-center mb-6">
          <span className="font-serif text-2xl font-bold tracking-widest text-vastra-charcoal">
            VASTRA
          </span>
          <h1 className="font-serif text-xl font-semibold text-vastra-charcoal mt-3">
            Reset Password
          </h1>
          <p className="text-xs text-vastra-muted mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
            <p className="font-semibold">Recovery Request Acknowledged</p>
            <p className="text-stone-600 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, password reset
              instructions will be dispatched.
            </p>
            <div className="p-2.5 bg-white/80 rounded border border-emerald-200 text-[11px] text-stone-600 text-left">
              <strong>Development Notice:</strong> Live transactional email dispatch requires SMTP/SendGrid credentials configured in production. For testing in development, please use the seed accounts or re-register.
            </div>
            <Link to="/login" className="inline-block pt-2">
              <Button size="sm" variant="outline">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                Account Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
                <Mail className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
              </div>
            </div>

            <Button type="submit" size="md" className="w-full">
              Send Instructions
            </Button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-vastra-border/60 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs text-vastra-muted hover:text-vastra-charcoal font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
