import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const href = buildWhatsAppLink(
    "Hello Jobert Apparels, I'd like to know more about your uniforms.",
    whatsappNumber
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 md:bottom-6"
      aria-label="Chat with Jobert Apparels on WhatsApp"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat with Jobert</span>
    </a>
  );
}
