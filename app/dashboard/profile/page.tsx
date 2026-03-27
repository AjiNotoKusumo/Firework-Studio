'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Twitter, Plus, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const interests = ['marketing', 'viral', 'content', 'growth', 'branding', 'social media'];

const accounts = [
  {
    platform: 'Instagram',
    username: '@indra.creates',
    icon: Instagram,
  },
  {
    platform: 'Twitter',
    username: '@indra_tw',
    icon: Twitter,
  },
];

export default function ProfilePage() {
  const [openConnect, setOpenConnect] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>(['marketing', 'viral', 'content']);
  const [input, setInput] = useState('');

  const suggestions = ['growth', 'branding', 'startup', 'design', 'ai', 'social media'];

  const normalize = (text: string) => text.trim().toLowerCase();

  const addInterest = (tag: string) => {
    const formatted = normalize(tag);
    if (!formatted) return;

    if (!userInterests.includes(formatted)) {
      setUserInterests([...userInterests, formatted]);
    }
  };

  const removeInterest = (tag: string) => {
    setUserInterests(userInterests.filter((t) => t !== tag));
  };

  const handleAddFromInput = () => {
    addInterest(input);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Logout */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition bg-amber-300 px-3 py-2 rounded-[12px]">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[20px] bg-[#A7D7A0] flex items-center justify-center overflow-hidden">
            <Image src="/firework.png" alt="avatar" width={50} height={50} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">Indra Sanjaya</h1>
            <p className="text-sm text-muted-foreground">Building viral content, one post at a time 🌱</p>
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Interests</h2>
            <button onClick={() => setOpenEdit(true)} className="text-sm text-[#4CAF50] hover:underline">
              Edit
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {userInterests.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E2E2E] text-sm font-medium capitalize">
                {tag}
              </span>
            ))}

            <button
              onClick={() => setOpenEdit(true)}
              className="px-4 py-1.5 rounded-full border border-dashed text-sm flex items-center gap-1 hover:bg-muted transition">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </motion.div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[24px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>

          <div className="space-y-3">
            {accounts.map((acc, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[16px] border border-border px-4 py-3 hover:bg-[#E8F5E9]/40 transition">
                <div className="flex items-center gap-3">
                  <acc.icon className="h-5 w-5 text-[#4CAF50]" />
                  <div>
                    <p className="text-sm font-medium">{acc.platform}</p>
                    <p className="text-xs text-muted-foreground">{acc.username}</p>
                  </div>
                </div>

                <button className="text-xs text-red-500 hover:underline">Disconnect</button>
              </div>
            ))}

            <button
              onClick={() => setOpenConnect(true)}
              className="w-full mt-2 rounded-[16px] border border-dashed py-3 text-sm hover:bg-muted transition">
              + Connect New Account
            </button>
          </div>
        </motion.div>
      </div>

      {/* Connect Modal */}
      {openConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] bg-background p-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
            <h2 className="text-lg font-semibold mb-4">Connect Account</h2>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between rounded-[16px] border px-4 py-3 hover:bg-[#E8F5E9]">
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-[#E1306C]" />
                  Instagram
                </div>
                <span className="text-xs text-muted-foreground">Connect</span>
              </button>

              <button className="w-full flex items-center justify-between rounded-[16px] border px-4 py-3 hover:bg-[#E8F5E9]">
                <div className="flex items-center gap-3">
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  Twitter
                </div>
                <span className="text-xs text-muted-foreground">Connect</span>
              </button>
            </div>

            <button
              onClick={() => setOpenConnect(false)}
              className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Interests Modal */}
      <AnimatePresence>
        {openEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-full max-w-lg rounded-[24px] bg-background p-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              <h2 className="text-lg font-semibold mb-4">Edit Interests</h2>

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Add interest..."
                  className="flex-1 rounded-[12px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A7D7A0]"
                />
                <button
                  onClick={handleAddFromInput}
                  className="px-4 py-2 rounded-[12px] bg-[#A7D7A0] text-sm font-medium hover:bg-[#8BC98B]">
                  Add
                </button>
              </div>

              {/* Selected */}
              <div className="flex flex-wrap gap-2 mb-6">
                {userInterests.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-sm capitalize">
                    {tag}
                    <button
                      onClick={() => removeInterest(tag)}
                      className="text-xs text-muted-foreground hover:text-red-500">
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addInterest(tag)}
                      className="px-3 py-1 rounded-full border text-xs hover:bg-[#E8F5E9]">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button onClick={() => setOpenEdit(false)} className="text-sm text-muted-foreground">
                  Cancel
                </button>

                <button
                  onClick={() => setOpenEdit(false)}
                  className="px-5 py-2 rounded-[12px] bg-[#A7D7A0] text-sm font-medium hover:bg-[#8BC98B]">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
