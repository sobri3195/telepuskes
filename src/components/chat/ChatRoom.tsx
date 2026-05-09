import { Send } from 'lucide-react';
import { useState } from 'react';
import { ClinicalContextHeader, ConsentModal, SoapNoteDrawer, SpecialistTeleconferenceModal } from '@/components/command/CommandCenterComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { autoReply } from '@/lib/triage';
import { useChatStore } from '@/stores/chatStore';
import type { Chat } from '@/types';
import { AttachmentUploader } from './AttachmentUploader';
import { MessageBubble } from './MessageBubble';

export function ChatRoom({ chat }: { chat: Chat }) {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const addMessage = useChatStore((s) => s.addMessage);

  function send(attachmentName?: string) {
    if (!text && !attachmentName) return;

    addMessage(chat.id, {
      id: crypto.randomUUID(),
      chatId: chat.id,
      sender: 'patient',
      text: text || 'Mengirim lampiran',
      timestamp: new Date().toISOString(),
      status: 'terkirim',
      attachmentName,
    });
    setText('');
    setTyping(true);

    setTimeout(() => {
      addMessage(chat.id, {
        id: crypto.randomUUID(),
        chatId: chat.id,
        sender: 'doctor',
        text: autoReply(chat.priority),
        timestamp: new Date().toISOString(),
        status: 'dibaca',
      });
      setTyping(false);
    }, 900);
  }

  return (
    <div className="flex h-[calc(100svh-12rem)] min-h-[32rem] flex-col overflow-hidden rounded-xl border bg-white sm:h-[72vh]">
      <div className="max-h-[42svh] space-y-3 overflow-y-auto border-b p-3 sm:max-h-none sm:p-4">
        <div className="min-w-0">
          <b className="block truncate">{chat.title}</b>
          <p className="text-xs text-muted-foreground">{chat.participants.join(' · ')} · Clinical Chat aman</p>
        </div>
        <ClinicalContextHeader priority={chat.priority} />
        <div className="flex flex-wrap gap-2">
          <ConsentModal />
          <SoapNoteDrawer />
          <Button size="sm" variant="outline">Buat Resep Simulasi</Button>
          <Button size="sm" variant="outline">Buat Rujukan</Button>
          <Button size="sm" variant="outline">Jadwalkan Follow-up</Button>
          <SpecialistTeleconferenceModal />
          <Button size="sm" variant="destructive">Tandai Darurat</Button>
          <Button size="sm">Tutup Konsultasi</Button>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {chat.messages.map((message) => <MessageBubble key={message.id} m={message} />)}
        {typing && <p className="text-sm text-muted-foreground">Dokter sedang mengetik...</p>}
      </div>
      <div className="grid gap-2 border-t p-3 sm:grid-cols-[auto_1fr_auto]">
        <AttachmentUploader onPick={send} />
        <Input
          className="min-w-0"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
          placeholder="Tulis pesan klinis, template pertanyaan dokter, atau edukasi pasien..."
        />
        <Button onClick={() => send()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
