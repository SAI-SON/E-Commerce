import React from 'react';
import { Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-vastra-charcoal text-vastra-surface text-xs py-2 px-4 text-center font-medium tracking-wider flex items-center justify-center gap-2 border-b border-vastra-charcoal/80">
      <Sparkles className="w-3.5 h-3.5 text-vastra-sand animate-pulse" />
      <span>
        Complimentary Shipping across India on orders above ₹1,999 | Handcrafted with Pure Devotion
      </span>
      <span className="hidden md:inline-block text-vastra-sand font-semibold ml-2">
        Use code: VASTRA10 for 10% off
      </span>
    </div>
  );
};
