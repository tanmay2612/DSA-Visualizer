import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Workflow } from 'lucide-react';
import { SidebarContent } from './SidebarContent';
import { Button } from '@/components/ui';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Radix Dialog supplies focus trapping, Escape-to-close, and scroll
 * locking (correctness, not visuals). Framer Motion drives the
 * enter/exit animation, keeping a single animation library across
 * the app rather than mixing in a Tailwind animation plugin.
 *
 * `forceMount` + AnimatePresence lets Framer Motion control the
 * unmount timing instead of Radix unmounting the content instantly.
 */
export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-y-0 left-0 z-50 h-full w-72 overflow-y-auto border-r border-border bg-background shadow-lg"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
                    <Workflow className="size-5 text-accent" />
                    Menu
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="size-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                <SidebarContent onNavigate={() => onOpenChange(false)} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
