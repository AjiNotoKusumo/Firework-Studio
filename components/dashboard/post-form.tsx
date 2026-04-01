'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  ImageIcon,
  ChevronRight,
  AtSign,
  Link2,
  MapPin,
  Hash,
  CalendarDays,
  Clock,
  X,
  Loader2,
} from 'lucide-react';
import { type Post, sampleImages } from '@/lib/posts-data';
import Swal from 'sweetalert2';
import { useSession } from '@/lib/auth-client';

interface PostFormProps {
  initialData?: Post;
  mode: 'create' | 'edit';
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  postId?: string;
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

export function PostForm({ initialData, mode, formData, setFormData, postId }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [hashtags, setHashtags] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<'mention' | 'hashtag' | 'link' | 'location' | null>(null);
  const [dropdownFilter, setDropdownFilter] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const { data: session, isPending } = useSession();

  const isScheduled = !!formData.scheduledAt;

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

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const body = new FormData();
          body.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          return data.url as string;
        }),
      );

      setFormData((prev: any) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      // Auto-select the first newly uploaded image
      setSelectedImageIndex(formData.images.length);
    } catch (err) {
      console.error('Upload error:', err);
      Swal.fire({
        title: 'Upload Failed',
        text: 'One or more images could not be uploaded. Please try again.',
        icon: 'error',
        background: '#e5ecdf',
        color: '#727070',
      });
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Delete image ──────────────────────────────────────────────────────────
  const deleteImage = (indexToDelete: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== indexToDelete),
    }));
    // Keep selected index in bounds
    setSelectedImageIndex((prev) => {
      if (indexToDelete < prev) return prev - 1;
      if (indexToDelete === prev) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: isScheduled ? 'scheduled' : 'draft',
        hashtags: hashtags,
      };
      const url = mode === 'edit' && initialData ? `/api/posts/${initialData.id}` : `/api/posts/${postId}`;
      const response = await fetch(`${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      if (mode === 'create') {
        localStorage.removeItem('creatingPostId');
      }

      if(isScheduled) {
        const response = await fetch(`/api/scheduler`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload, 
            userId: session?.user.id,
            postId: mode === 'edit' && initialData ? initialData.id : postId
          }),
        });
      }

      Swal.fire({
        title: 'Saved!',
        text: 'Your post has been saved.',
        icon: 'success',
        background: '#e5ecdf',
        color: '#727070',
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

  const handleCancel = async () => {
    try {
      const conirmation = await Swal.fire({
        title: 'Are you sure?',
        text: 'Any unsaved changes will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        background: '#e5ecdf',
        color: '#727070',
      });

      if (!conirmation.isConfirmed) {
        return Swal.fire({
          title: 'Cancelled',
          text: 'You can continue editing your post.',
          icon: 'error',
          background: '#e5ecdf',
          color: '#727070',
        });
      }

      if (mode === 'create' && postId) {
        const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        localStorage.removeItem('creatingPostId');
      }

      router.push('/dashboard/planning');
    } catch (error) {
      const message = (error as Error).message;
      await Swal.fire({
        title: 'Failed',
        text: message || 'Failed to cancel post creation',
        icon: 'error',
        background: '#e5ecdf',
        color: '#727070',
      });
    }
  };

  

  const filteredUsers = dummyUsers.filter((u) => u.username.includes(dropdownFilter));
  const filteredHashtags = dummyHashtags.filter((tag) => tag.includes(dropdownFilter));


  return (
    <div className="flex flex-col h-full relative">
      {/* ── Image Uploader ── */}
      <div className="p-5 border-b border-border">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Media</p>

        {/* Main preview */}
        <div className="relative aspect-square w-full rounded-[14px] bg-secondary overflow-hidden mb-3">
          {formData.images[selectedImageIndex] ?
            <Image src={formData.images[selectedImageIndex]} alt="preview" fill className="object-cover" />
          : <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">No image selected</span>
            </div>
          }
          {/* Uploading overlay on main preview */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
              <span className="text-white text-xs font-medium">Uploading...</span>
            </div>
          )}
        </div>

        {/* Thumbnails + add button */}
        <div className="flex gap-2 flex-wrap">
          {formData.images.map((img: string, i: number) => (
            <div key={i} className="relative group">
              {/* Thumbnail */}
              <button
                onClick={() => setSelectedImageIndex(i)}
                className={`relative w-12 h-12 rounded-[10px] overflow-hidden border-2 transition-all ${
                  i === selectedImageIndex ? 'border-primary' : 'border-transparent'
                }`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>

              {/* × Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(i);
                }}
                className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 rounded-full bg-red-500 text-white
                           flex items-center justify-center shadow-md
                           opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title="Remove image">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* + Add button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-12 h-12 rounded-[10px] border border-dashed border-muted-foreground/40
                       flex items-center justify-center
                       hover:border-primary hover:text-primary
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors text-muted-foreground">
            {isUploading ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : <Plus className="h-4 w-4" />}
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
              <option value="" disabled>
                Select Platform
              </option>
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
              <option value="" disabled>
                Select Type
              </option>
              <option value="carousel">Carousel</option>
              <option value="video">Video</option>
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
              value={formData.scheduledAt ? new Date(formData.scheduledAt).toLocaleDateString('en-CA') : ''}
              onChange={(e) => {
                const newDate = e.target.value;
                const currentTime =
                  formData.scheduledAt ?
                    new Date(formData.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : '12:00';
                const local = new Date(`${newDate}T${currentTime}`);
                setFormData((prev: any) => ({ ...prev, scheduledAt: local.toISOString() }));
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
              value={
                formData.scheduledAt ?
                  new Date(formData.scheduledAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : ''
              }
              onChange={(e) => {
                const newTime = e.target.value;
                const currentDate =
                  formData.scheduledAt ?
                    new Date(formData.scheduledAt).toLocaleDateString('en-CA')
                  : new Date().toLocaleDateString('en-CA');
                const local = new Date(`${currentDate}T${newTime}`);
                setFormData((prev: any) => ({ ...prev, scheduledAt: local.toISOString() }));
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
          onClick={(e) => handleKeyUp(e as any)}
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
              <div
                key={tag}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  insertAtCursor(`${tag} `);
                  setHashtags((prev) => [...prev, tag]);
                }}>
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

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center justify-end gap-2">
        <button
          onClick={handleCancel}
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
