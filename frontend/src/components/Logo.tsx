"use client";

import { Globe2 } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Globe2 className="w-10 h-10 text-accent" />
      <h1 className=" text-3xl    font-bold text-accent font-space-grotesk">
        Traveloop
      </h1>
    </div>
  );
};

export default Logo;
