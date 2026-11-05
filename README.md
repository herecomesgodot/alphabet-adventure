# Alphabet Adventure

An alphabet game for a 3–4-year-old: a light blue and white panda buddy, an island with four worlds (Bubble Pop under the sea, Peekaboo in the garden, Trace & Sparkle in the night sky, and a Sticker Book), and a grown-ups' area for recording your voice. It works offline once installed, and doesn't need Claude or any account to run.

## 1. Put it online (once, about 10 minutes)

An iPad or iPhone can only install the app from a web address. GitHub Pages is free:

1. Create a free account at **github.com** (or sign in).
2. Click **+** (top right) → **New repository**. Name it `alphabet-adventure`, choose **Public**, and click **Create repository**.
3. On the new repository's page, click **uploading an existing file**. Drag in everything inside this `Alphabet Adventure` folder **except** the `docs`, `tests` and `.superpowers` folders and `package.json` (they're for building, not playing; leaving them in does no harm). Click **Commit changes**.
4. Go to **Settings** → **Pages**. Under "Branch" pick **main** and **/ (root)**, then **Save**.
5. After a minute the page shows your address, something like `https://YOUR-NAME.github.io/alphabet-adventure/`. That's the app's address.

Netlify Drop (app.netlify.com/drop) also works: drag the folder onto the page.

## 2. Install it on the iPad or iPhone

1. Open the address in **Safari** (it must be Safari on iPhone/iPad).
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Open it from the new **ABC** icon. It runs full-screen, and after the first launch it works without internet.

The first time it opens, the grown-ups' setup asks for your child's name and walks you through recording the 26 letter sounds (about 5 minutes; you can skip and finish later).

**Getting back to the grown-ups' area:** on the island, press and hold the small gear in the bottom-right corner for 3 seconds.

## 3. Handy iPad/iPhone tips

- **Guided Access** keeps your child inside the app: Settings → Accessibility → Guided Access → turn on. In the app, triple-click the side (or Home) button to start it.
- **No sound?** Check the silent switch and volume. A wiggling red speaker in the corner means sound is blocked; tap it.
- **Microphone blocked?** Settings → Safari → Microphone → Allow (or Settings → Privacy → Microphone).

## 4. Moving to another device

Grown-ups' area → **Settings** → **Back up**. This makes one file with the name, progress, stickers and every recording. AirDrop or email it to yourself, open the app on the other device, and use **Restore from a backup…**.

Back up after recording, so your voice is safe if a device is reset.

## 5. On a computer

Open the same web address in any browser. You can also double-click `index.html` in this folder; that works, but recordings can't be saved in that mode, and some browsers won't keep progress. Use the web address for the full app.

## 6. Check it on the real iPad (once)

The parts that a desktop preview can't test:

- [ ] Install to the Home Screen; the ABC icon opens full-screen.
- [ ] Turn on Airplane Mode, close the app fully, reopen it: it still starts and plays.
- [ ] Record a letter sound; it plays back; Bubble Pop uses your voice for that letter.
- [ ] Finish one round of each game (Bubble Pop, Peekaboo, Trace & Sparkle).
- [ ] Back up on the iPad, then restore on the iPhone: name, stickers and recordings come across.

## For updates

Upload the changed files. Whenever the app opens with internet it fetches the latest files (and keeps them for offline use), so devices update by themselves. If you add a new file, also add it to the list at the top of `sw.js` so it works offline (`npm test` checks this). Your child's progress and your recordings are never touched by an update.

Record your voice on the iPad or iPhone it will be played on: recordings made in Chrome on a computer may not play on an iPhone.

