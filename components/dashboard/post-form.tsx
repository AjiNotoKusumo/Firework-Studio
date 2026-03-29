'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, ImageIcon, ChevronRight, AtSign, Link2, MapPin, Hash, CalendarDays, Clock, Layers } from 'lucide-react';
import { type Post, sampleImages, strategies } from '@/lib/posts-data';

interface PostFormProps {
  initialData?: Post;
  mode: 'create' | 'edit';
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface User {
  id: string;
  username: string;
}

const dummyUsers: User[] = [
  { id: '1', username: 'alice' },
  { id: '2', username: 'bob' },
  { id: '3', username: 'charlie' },
];

const dummyHashtags = ['#fitness', '#travel', '#food', '#coding'];
const mockLocations = ['New York', 'Paris', 'Tokyo', 'Rio de Janeiro'];

export function PostForm({ initialData, mode, formData, setFormData }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [activeDropdown, setActiveDropdown] = useState<'mention' | 'hashtag' | 'link' | 'location' | null>(null);
  const [dropdownFilter, setDropdownFilter] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const isScheduled = !!formData.scheduledDate;

  const insertAtCursor = (insertText: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = formData.caption.substring(0, start) + insertText + formData.caption.substring(end);
    setFormData((prev: any) => ({ ...prev, caption: newText }));
    setActiveDropdown(null);
    setDropdownFilter('');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insertText.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const addImage = () => {
    const available = sampleImages.filter((img) => !formData.images.includes(img));
    if (available.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        images: [...prev.images, available[0]],
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: isScheduled ? 'scheduled' : 'draft',
        shareToPlatforms: formData.shareToFacebook ? ['facebook'] : [],
      };
      const url = mode === 'edit' && initialData ? `/api/posts/${initialData.id}` : '/api/posts';
      await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.push('/dashboard/planning');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const text = textareaRef.current.value.substring(0, cursor);

    const matchMention = /@(\w*)$/.exec(text);
    const matchHashtag = /#(\w*)$/.exec(text);
    const matchLink = /(https?:\/\/[^\s]*)$/.exec(text);

    if (matchMention) {
      setActiveDropdown('mention');
      setDropdownFilter(matchMention[1]);
    } else if (matchHashtag) {
      setActiveDropdown('hashtag');
      setDropdownFilter(matchHashtag[1]);
    } else if (matchLink) {
      setActiveDropdown('link');
      setLinkInput(matchLink[1]);
    } else if (activeDropdown === 'mention' || activeDropdown === 'hashtag' || activeDropdown === 'link') {
      setActiveDropdown(null);
      setDropdownFilter('');
      setLinkInput('');
    }
  };

  const filteredUsers = dummyUsers.filter((u) => u.username.includes(dropdownFilter));
  const filteredHashtags = dummyHashtags.filter((tag) => tag.includes(dropdownFilter));

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Image Uploader ── */}
      <div className="p-5 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Media</p>
        <div className="relative aspect-square w-full rounded-[14px] bg-secondary overflow-hidden mb-3">
          {formData.images[selectedImageIndex] ?
            <Image src={formData.images[selectedImageIndex]} alt="preview" fill className="object-cover" />
          : <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">No image selected</span>
            </div>
          }
        </div>
        <div className="flex gap-2 flex-wrap">
          {formData.images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedImageIndex(i)}
              className={`relative w-12 h-12 rounded-[10px] overflow-hidden border-2 transition-all ${
                i === selectedImageIndex ? 'border-primary' : 'border-transparent'
              }`}>
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
          <button
            onClick={addImage}
            className="w-12 h-12 rounded-[10px] border border-dashed border-muted-foreground/40 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Platform + Type ── */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Publish Settings
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted-foreground">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, platform: e.target.value }))}
              className="rounded-[10px] border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted-foreground">Post Type</label>
            <select
              value={formData.postType}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, postType: e.target.value }))}
              className="rounded-[10px] border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="post">Post</option>
              <option value="stories">Stories</option>
              <option value="reels">Reels</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Date
            </label>
            <input
              type="date"
              value={formData.scheduledDate.split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value;
                const time = formData.scheduledDate.split('T')[1] || '12:00';
                setFormData((prev: any) => ({
                  ...prev,
                  scheduledDate: date ? `${date}T${time}` : '',
                }));
              }}
              className="rounded-[10px] border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Time
            </label>
            <input
              type="time"
              value={formData.scheduledDate.split('T')[1] || ''}
              onChange={(e) => {
                const time = e.target.value;
                const date = formData.scheduledDate.split('T')[0] || '';
                setFormData((prev: any) => ({
                  ...prev,
                  scheduledDate: date ? `${date}T${time}` : '',
                }));
              }}
              className="rounded-[10px] border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* ── Caption ── */}
      <div className="px-5 py-4 border-b border-border flex-1 relative">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Caption</p>
        <textarea
          ref={textareaRef}
          value={formData.caption}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, caption: e.target.value }))}
          onClick={handleKeyUp}
          onKeyUp={handleKeyUp}
          placeholder="Write your caption..."
          className="w-full h-28 rounded-[12px] border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-2 text-muted-foreground relative">
          <div className="flex gap-3">
            <button onClick={() => setActiveDropdown(activeDropdown === 'mention' ? null : 'mention')}>
              <AtSign className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => setActiveDropdown(activeDropdown === 'hashtag' ? null : 'hashtag')}>
              <Hash className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => setActiveDropdown(activeDropdown === 'link' ? null : 'link')}>
              <Link2 className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}>
              <MapPin className="h-3.5 w-3.5 hover:text-foreground transition-colors" />
            </button>
          </div>
          <span className={`text-[11px] ${formData.caption.length > 2200 ? 'text-red-500' : ''}`}>
            {formData.caption.length} / 2200
          </span>
        </div>

        {/* Dropdowns */}
        {activeDropdown === 'mention' && (
          <div className="absolute z-10 mt-1 border rounded bg-white shadow w-64 max-h-32 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => insertAtCursor(`@${user.username} `)}>
                @{user.username}
              </div>
            ))}
          </div>
        )}
        {activeDropdown === 'hashtag' && (
          <div className="absolute z-10 mt-1 border rounded bg-white shadow w-64 max-h-32 overflow-y-auto">
            {filteredHashtags.map((tag) => (
              <div key={tag} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => insertAtCursor(`${tag} `)}>
                {tag}
              </div>
            ))}
          </div>
        )}
        {activeDropdown === 'link' && (
          <div className="absolute z-10 mt-1 border rounded bg-white shadow p-2 w-64">
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Paste URL..."
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <button
              className="mt-1 px-2 py-1 bg-primary text-white rounded text-sm"
              onClick={() => {
                insertAtCursor(linkInput + ' ');
                setLinkInput('');
              }}>
              Insert
            </button>
          </div>
        )}
        {activeDropdown === 'location' && (
          <div className="absolute z-10 mt-1 border rounded bg-white shadow p-2 w-64 flex flex-wrap gap-1">
            {mockLocations.map((loc) => (
              <button
                key={loc}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                onClick={() => insertAtCursor(`📍${loc} `)}>
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Strategy ── */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
          <Layers className="h-3 w-3" /> Strategy
        </p>
        <select
          value={formData.strategy}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, strategy: e.target.value }))}
          className="w-full rounded-[10px] bg-[#A7D7A0]/30 border border-[#A7D7A0] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A7D7A0]">
          <option value="">Select a strategy...</option>
          {strategies.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center justify-end gap-2">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-[10px] text-sm hover:bg-secondary transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.caption.trim() || isSubmitting}
          className="px-5 py-2 bg-[#A7D7A0] rounded-[10px] text-sm font-medium flex items-center gap-1.5 hover:bg-[#8BC483] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {isSubmitting ? 'Saving...' : 'Save'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
