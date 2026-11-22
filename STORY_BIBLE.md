# SILENT MALL: THE LAST NIGHT

## Premise

Seven years ago the mall in this city sealed itself at 11:47 PM with forty-one people still inside. The inquiry called it a gas leak. The city called it a tragedy. Then it called it a date on a plaque in the west wing, and stopped calling it anything.

You were nineteen that night, working the closing shift, and you had your little sister with you because your mother was dying in a hospital bed across town and there was nobody else to leave her with. When the crowd pushed through the shutter, her hand slipped out of yours. You told her to wait by the toys. You said you would come back.

Tonight is the seventh anniversary. The mall let you in.

The building is not simply haunted. It absorbed that night and has been repeating it ever since, and it recruits the living to complete the shift. Every sound gives the Listener a trail. Every sign points the wrong way. Every unclaimed thing is filed and kept. The mall is not cruel; it is simply open, and it intends to stay open.

To get out you must cross seven floors, take what the building is holding, and decide on the roof whether you leave alone.

## The emotional spine

- **The promise.** "Wait by the toys. I'll come back." The game is the seven years that sentence has been running.
- **The guilt is specific, not atmospheric.** The player did not do anything evil. They were nineteen, frightened, and holding on as hard as they could. The horror is that it was not enough.
- **The entities are all people who stayed too long for someone.** The guard who went back in. The usher who obeyed an order. The projectionist who would not stop the reel. The manager who could not imagine a quiet building. None of them are monsters; each of them is a decision that never ended.
- **Two endings.** Carry her name into the morning, or walk out with your own life and leave the toy department light on.

## Chapters

### 01 — THE CLOSING SHIFT / The Main Atrium / **The Listener**
Arjun was the night guard. He pulled people out through the shutter one at a time, and when he saw a small hand reaching up he went back inside for it. The mall learned the sound of his partner's footsteps and has been calling him through the corridors with it ever since. He is still answering.

*Gameplay:* sound hunting. Loud movement, impacts and thrown cans draw him in.

*Cinematic:* the corridor that will not open, the routine in the atrium, the plaque with his name on it.

### 02 — BELOW THE FOOD COURT / The Service Level / **The Usher**
Elias Vale kept the service corridors for twenty-three years. When workers found the sealed cinema exit, the manager ordered him to keep the corridor clear, so he redirected forty-one people away from the only door that still opened. He obeyed until the alarms stopped.

*Gameplay:* false announcements and moved signs pull the hunter toward decoy exits.

*Cinematic:* the lift that only goes down, the corridor he kept clear, the log that ends mid-sentence.

### 03 — THE CHILDREN'S WING / The Toy Department / **The Static Child**
Anya was seven. She was told to wait by the toys and she has done exactly that for seven years. The cameras record her in rooms she cannot reach because she lives in the gap between frames, in the half second where the mall is not looking.

*Gameplay:* she drops out of frame, distorts the image, and returns somewhere near where you were.

*Cinematic:* the department that has not aged, the wristband dated tomorrow, the monitors that keep finding her.

### 04 — THE LOST & FOUND / The Stockroom / **The Collector**
She ran the Lost & Found counter. Everything unclaimed must be filed, labelled and kept, including the people who never came back for them. Box 41 holds one small shoe and one paper wristband. The box beside it has your name on it, written the night you left.

*Gameplay:* she re-shelves the exit and sends the hunter to your last known file.

*Cinematic:* the shelving banks, the labelled boxes, the polite voice that is past due.

### 05 — THE SCREENING ROOM / The Sealed Cinema / **The Projectionist**
He was running the late show when the alarms started, and he kept the reel turning because stopping it would mean admitting the night was over. Lately he has been splicing your face into the footage.

*Gameplay:* floods the room with light and your own memory; the room goes white and loud.

*Cinematic:* the sealed auditorium, the beam, the frame of a girl waving at someone already running.

### 06 — THE HEART OF THE MALL / The Management Floor / **The Night Manager**
Mr. Vale signed the closure order at 11:52 PM and had the last open exit bricked up, because a mall must stay full, lit and open forever. He does not hunt. He schedules. You are on the rota now.

*Gameplay:* the boss phase. Opening the shutter wakes him and the pursuit accelerates.

*Cinematic:* the office, the order on the desk, the note in the margin: "It will be quiet tomorrow. I cannot."

### 07 — THE ROOF / The Service Stairs / **The Mall**
The stairs climb one floor higher than the building has. At 5:41 AM the hatch opens both ways.

*Gameplay:* the building turns off its lights floor by floor while you run the last corridor.

*Ending:* an explicit choice.

- **THE PROMISE KEPT** — you take the wristband, say her name, and the mall goes dark behind you floor by floor. The plaque in the west wing gets a second date: the day someone came back.
- **THE PROMISE BROKEN** — you walk out into a city that does not know your name. The toy department light stays on behind you, and it will stay on tomorrow.

## The seventh entity

**THE MALL** is the antagonist of the whole night. Corridors, announcements and locked doors are its nervous system. It keeps the missing as echoes, it files the unclaimed, and it is always, patiently, open.

## Cutscene inventory

Rendered in-browser as animated shots (CSS/DOM, no video, no voice acting):

| Sequence | Shots | Trigger |
| --- | --- | --- |
| Prologue — Seven Years Ago | 6 | First entry |
| Chapter cinematics | 3 each (21 total) | On entering each chapter |
| Memory fragments | 2 each (14 total) | On picking up each keycard |
| Ending — The Promise Kept | 5 | Final choice |
| Ending — The Promise Broken | 3 | Final choice |
| Caught | live in-game scare | Contact with the entity |

Total: **49 authored shots** across 18 sequences, each with its own palette, silhouettes, letterbox and typed caption.

## Implemented scope

- Seven sequential chapters, seven distinct walkable floor plans: atrium, service tunnels, toy-wing aisles, stockroom, cinema, management ring, roof deck.
- Chapter-specific props, lighting positions, facade dressing, keycard placement and world tinting.
- Six entity behaviours: sound hunt, false announcements, phase-and-reappear, filing, projection flood, boss scheduling, plus the final lockdown.
- A dedicated cinematic layer (`story.js` / `story.css`) with letterbox, shot counter, typed captions, skip control and a two-way ending choice.
- Story panels with the long-form chapter text, and an in-game ENTITY FILES archive of all seven entities.

## Production notes

All cinematics are original in-browser presentation: layered gradients, CSS-drawn silhouettes, light sweeps and grain. There is no pre-rendered video, no voice acting and no bespoke sprite sheets; the entity appearances reuse the existing pixel-art hunter sprite while behaviours and layouts are implemented in code.

## Entity appearances

Each entity is drawn separately rather than reusing one sprite (`entities.js`). The silhouette vocabulary is shared — flat ink, one rim light, one accent — but the shapes are not:

| Chapter | Entity | Silhouette | Accent |
| --- | --- | --- | --- |
| 01 | The Listener | tall, thin, peaked guard cap, torch in hand | cold green |
| 02 | The Usher | hunched, wide shoulders, peaked cap, swinging lantern | amber |
| 03 | The Static Child | half height, round head, paper wristband, frame-slip glitch | pale mint |
| 04 | The Collector | cardigan, hair in a bun, arms full of labelled boxes | bone |
| 05 | The Projectionist | thin body, projector housing instead of a head, glowing lens | red |
| 06 | The Night Manager | broad suit shoulders, slicked hair, collar and tie | red |
| 07 | The Mall | too tall, too wide, extra limbs, a red seam down the chest | red |

The ENTITY FILES panel shows each silhouette beside its file.

## Floor environments

Every chapter is built of different material, so the floor itself tells you where you are:

1. Main Atrium — terrazzo and checker tile.
2. Service Level — bare concrete, floor drains, standing water.
3. Children's Wing — soft play carpet with checker thresholds.
4. Lost & Found — dusty concrete and cracked slab.
5. Sealed Cinema — red house carpet, checker lobby.
6. Management Floor — polished terrazzo and marble checker.
7. Roof — wet concrete, drains, cracks.
