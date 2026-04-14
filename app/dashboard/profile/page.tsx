'use client';

import { authClient, signOut, useSession } from '@/lib/auth-client';
import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, Twitter, Plus, LogOut, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// const accounts = [
//   { platform: 'Instagram', username: '@indra.creates', icon: Instagram },
//   { platform: 'Twitter', username: '@indra_tw', icon: Twitter },
// ];

const SUGGESTIONS = ['growth', 'branding', 'startup', 'design', 'ai', 'social media'];

// ── Shared overlay + modal variants ──────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, y: 12, transition: { duration: 0.18, ease: 'easeIn' } },
};

export default function ProfilePage() {
  const router = useRouter()
  const [openConnect, setOpenConnect] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const { data: session, isPending } = useSession();
  const [accounts, setAccounts] = useState<any>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }

    setUserInterests(session?.user?.interests || []);
  }, [isPending, session, router]);

  const handleInterestsUpdate = async () => {
    try {
      if(userInterests.length === 0) {
        throw new Error("Please select at least one interest to continue.")
      }

      const { data, error } = await authClient.updateUser({
        interests: userInterests, // Better Auth handles the array/JSON stringifying
        onboardingComplete: true,
      });

      if (!error) {
        // Force a router refresh so the middleware sees the updated session
        router.refresh(); 
        setOpenEdit(false)
      } else {
        throw new Error( error.message);
      }
    } catch (error) {
      console.log("Failed to update user:", error);
    }
    
  };

  const normalize = (t: string) => t.trim().toLowerCase();

  const addInterest = (tag: string) => {
    const f = normalize(tag);
    if (f && !userInterests.includes(f)) setUserInterests((p) => [...p, f]);
  };

  const handleLogout = () => {
    signOut()
    router.push("/");
  }

  const handleLinkInstagram = async () => {
    try {
      const {data, error} = await authClient.oauth2.link({
        providerId: 'instagram',
        callbackURL: '/dashboard/profile',
      })

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error linking Instagram account:", error);
    }
  }

  const handleLinkTwitter = async () => {
    try {
      const {data, error} = await authClient.linkSocial({
        provider: 'twitter',
        callbackURL: '/dashboard/profile',
      })

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error linking Twitter account:", error);
    }
  }

  const getMyAccounts = async () => {
    try {
      const { data, error } = await authClient.listAccounts();

      if (error) {
        throw new Error(error.message);
      }
      setAccounts(data.map((acc: any) => ({
        providerId: acc.providerId,
        createdAt: new Date(acc.createdAt).toLocaleDateString(),
        Icon: acc.providerId === "instagram" ? Instagram : Twitter
      })));
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
    }
  }

  const removeInterest = (tag: string) => setUserInterests((p) => p.filter((t) => t !== tag));

  const handleAddFromInput = () => {
    addInterest(input);
    setInput('');
  };

  useEffect(() => {
    if (session) {
      getMyAccounts();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Logout */}
        <div className="flex justify-end">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition bg-amber-300 px-3 py-2 rounded-[12px]">
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
            <h1 className="text-2xl font-semibold text-foreground">{session?.user?.name}</h1>
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
            {accounts.map((acc : any, i : any) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[16px] border border-border px-4 py-3 hover:bg-[#E8F5E9]/40 transition">
                <div className="flex items-center gap-3">
                  <acc.Icon className="h-5 w-5 text-[#4CAF50]" />
                  <div>
                    <p className="text-sm font-medium">{acc.providerId}</p>
                    <p className="text-xs text-muted-foreground">{acc.createdAt}</p>
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

      {/* ═══════════════════════════════════════
          CONNECT ACCOUNT MODAL
          Both overlay and card are motion elements
          wrapped in AnimatePresence so exit animations fire.
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {openConnect && (
          <motion.div
            key="connect-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenConnect(false)}>
            <motion.div
              key="connect-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4 rounded-[24px] bg-background p-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Connect Account</h2>
                <button
                  onClick={() => setOpenConnect(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <button onClick={handleLinkInstagram} className="w-full flex items-center justify-between rounded-[16px] border px-4 py-3 hover:bg-[#E8F5E9] transition">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-[#E1306C]" />
                    <span className="text-sm font-medium">Instagram</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Connect</span>
                </button>

                <button onClick={handleLinkTwitter} className="w-full flex items-center justify-between rounded-[16px] border px-4 py-3 hover:bg-[#E8F5E9] transition">
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                    <span className="text-sm font-medium">Twitter</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Connect</span>
                </button>
              </div>

              <button
                onClick={() => setOpenConnect(false)}
                className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground transition">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          EDIT INTERESTS MODAL
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {openEdit && (
          <motion.div
            key="edit-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenEdit(false)}>
            <motion.div
              key="edit-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-4 rounded-[24px] bg-background p-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Edit Interests</h2>
                <button
                  onClick={() => setOpenEdit(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFromInput()}
                  placeholder="Add interest..."
                  className="flex-1 rounded-[12px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A7D7A0]"
                />
                <button
                  onClick={handleAddFromInput}
                  className="px-4 py-2 rounded-[12px] bg-[#A7D7A0] text-sm font-medium hover:bg-[#8BC98B] transition">
                  Add
                </button>
              </div>

              {/* Selected tags */}
              <div className="flex flex-wrap gap-2 mb-5 min-h-[36px]">
                <AnimatePresence>
                  {userInterests.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-sm capitalize">
                      {tag}
                      <button
                        onClick={() => removeInterest(tag)}
                        className="text-xs text-muted-foreground hover:text-red-500 transition">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              {/* Suggestions */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addInterest(tag)}
                      disabled={userInterests.includes(tag)}
                      className="px-3 py-1 rounded-full border text-xs hover:bg-[#E8F5E9] transition disabled:opacity-40 disabled:cursor-not-allowed">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition">
                  Cancel
                </button>
                <button
                  onClick={() => handleInterestsUpdate()}
                  className="px-5 py-2 rounded-[12px] bg-[#A7D7A0] text-sm font-medium hover:bg-[#8BC98B] transition">
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
