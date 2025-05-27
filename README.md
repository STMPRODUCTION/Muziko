# 🎵 [Muziko](https://stmproduction.github.io/Muziko/) - MIDI Sight-Reading Trainer

## 📖 General Description

**Muziko** is an educational app designed for musicians who want to improve their sight-reading skills. It connects to any digital MIDI instrument (e.g., digital piano, MIDI guitar) and generates musical scores. Users must accurately perform the music shown, and the app provides real-time feedback on note accuracy.

Muziko is designed for students, conservatory attendees, music teachers, and passionate amateurs. The app will be available in both a full version and a FOSS (Free and Open Source Software) edition for the community.

---

## 🧱 Planned Modular Structure

The application is organized into independent modules to ensure portability and easy maintenance:

| Module             | Description                                                              |
|--------------------|---------------------------------------------------------------------------|
| UI Module          | React + Tailwind-based responsive interface                              |
| MIDI Input         | Uses Web MIDI API to receive input from MIDI instruments                 |
| Score Generator    | Generates random or difficulty-based exercises                           |
| Evaluation Engine  | Compares MIDI input with the score and provides scoring & feedback       |
| Visual Feedback    | Highlights incorrect notes and offers suggestions                        |
| Local Persistence  | Stores progress and user preferences                                     |

---

## 🔁 User Flow

1. **App Launch**  
   → Main screen with options: Start, Settings, History, About

2. **MIDI Connection**  
   → Auto-detect instrument, sound test

3. **Exercise Selection**  
   → Choose difficulty level, key, and type (pitch, rhythm, or both)

4. **Exercise Execution**  
   → Score appears; user plays it in real-time

5. **Instant Feedback**  
   → Displays accuracy, time, and overall score

6. **History & Progress**  
   → Saves stats and allows review of past exercises

---

## ⚙️ Technologies Used & Motivation

| Component         | Technology               | Motivation                                                   |
|-------------------|--------------------------|--------------------------------------------------------------|
| Interface         | React + Tailwind         | Fast development, modern look, responsive design             |
| Desktop App       | Electron.js              | Cross-platform support (Windows/macOS/Linux)                 |
| MIDI Processing   | Web MIDI API / `midi`    | Direct MIDI input access, well-supported in Electron         |
| Persistence       | File System              | Simple and reliable local data storage                       |
| Code Management   | Git (GitHub)             | Collaboration, versioning, open contribution                 |
| Testing           | Unit tests + manual QA   | Ensures stability and reliability                            |
| Licensing         | Apache 2.0               | Encourages community contribution and flexibility            |

---

## 🆓 Licensing & FOSS Version Plan

Muziko will include a **Free and Open Source (FOSS)** version available on GitHub.

### 🧩 Features in the FOSS Version:
- Basic sheet music exercises  
- Simple correct/incorrect feedback  
- Standard MIDI input support  
- Score import  
- Automatically generated exercises  

### 💎 Additional Features in the Full Version:
- Adaptive difficulty exercises  
- Advanced statistics  
- Cloud integration / PDF export  

Made with ❤️ for the music education community.
