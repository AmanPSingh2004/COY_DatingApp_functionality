
import express from 'express';
import cors from 'cors';
import profiles from './profiles.json' with { type: 'json' };
import fs from 'node:fs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const SWIPES_FILE = './swipes.json';

function readSwipes() {
  if (!fs.existsSync(SWIPES_FILE)) {
    fs.writeFileSync(SWIPES_FILE, '[]');
  }

  return JSON.parse(fs.readFileSync(SWIPES_FILE, 'utf8'));
}

function saveSwipes(swipes) {
  fs.writeFileSync(SWIPES_FILE, JSON.stringify(swipes, null, 2));
}

app.get('/feed', (req, res) => {
  const swipes = readSwipes();
  const swipedIds = swipes.map((swipe) => Number(swipe.profileId));
  
  const feed = profiles
    .filter((profile) => !swipedIds.includes(Number(profile.id)))
    .map(({ hasLikedUser, ...publicProfile }) => publicProfile);

  res.json(feed);
});

app.post('/swipe', (req, res) => {
  const { profileId, action } = req.body;

  if (!profileId || !['like', 'pass'].includes(action)) {
    return res.status(400).json({
      error: 'A valid profileId and action (like or pass) are required.',
    });
  }

  const profile = profiles.find(
    (item) => Number(item.id) === Number(profileId)
  );

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const swipes = readSwipes();

  if (swipes.some((swipe) => Number(swipe.profileId) === Number(profileId))) {
    return res.status(409).json({ error: 'Already swiped on this profile.' });
  }

  swipes.push({
    profileId: Number(profileId),
    action,
  });

  saveSwipes(swipes);

  res.json({
    success: true,
    profileId: Number(profileId),
    action,
    matched: action === 'like' && profile.hasLikedUser === true,
  });
});


app.get('/matches', (req, res) => {
  const swipes = readSwipes();

  const likedProfileIds = swipes
    .filter((swipe) => swipe.action === 'like')
    .map((swipe) => Number(swipe.profileId));

  const matches = profiles
    .filter(
      (profile) =>
        likedProfileIds.includes(Number(profile.id)) &&
        profile.hasLikedUser === true
    )
    .map(({ hasLikedUser, ...publicProfile }) => publicProfile);

  res.json(matches);
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
