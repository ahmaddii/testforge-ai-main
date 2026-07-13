import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

import projectRoutes from './routes/projects';
import requirementRoutes from './routes/requirements';
import generateRoutes from './routes/generate';
import testCaseRoutes from './routes/test-cases';
import reportRoutes from './routes/reports';
import defectRoutes from './routes/defects';
import teamRoutes from './routes/team';
import profileRoutes from './routes/profile';
import messagesRoutes from './routes/messages';
import billingRoutes, { paddleWebhook } from './routes/billing';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notifications';
import releaseRoutes from './routes/releases';
import environmentRoutes from './routes/environments';
import testPlanRoutes from './routes/test-plans';
import executionRunRoutes from './routes/execution-runs';
import selfHealingRoutes from './routes/self-healing';
import specyRoutes from './routes/specy';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.post('/api/paddle/webhook', express.raw({ type: 'application/json' }), paddleWebhook);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/test-plans', testPlanRoutes);
app.use('/api/execution-runs', executionRunRoutes);
app.use('/api/self-healing', selfHealingRoutes);
app.use('/api/specy', specyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Speclane Backend running on port ${port}`);
});
