import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { verifySuperAdmin } from './admin';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'resolved';
}

let FALLBACK_DB: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Sarah Jenkins',
    email: 'sarah@fintech-global.com',
    company: 'Fintech Global',
    inquiryType: 'sales',
    message: 'We are looking for an automated QA solution for our 35-person engineering team. Interested in the Enterprise plan with VPC deployment.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'new'
  },
  {
    id: 'inq-2',
    name: 'Marcus Vance',
    email: 'm.vance@healthsync.io',
    company: 'HealthSync',
    inquiryType: 'demo',
    message: 'Would love a live demo focusing on your Jitsi integration and test case generation speed.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'contacted'
  }
];

const router = Router();

// Super Admin CRM Endpoint
router.get('/', authenticate, verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase table "inquiries" not found or error. Using fallback DB.', error.message);
      return res.json(FALLBACK_DB);
    }

    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      inquiryType: row.inquiry_type,
      message: row.message,
      createdAt: row.created_at,
      status: row.status || 'new'
    }));

    res.json(formatted);
  } catch (err: any) {
    res.json(FALLBACK_DB);
  }
});

// Public Website Form Submission
router.post('/', async (req: Request, res: Response) => {
  const { name, email, company, inquiryType, message } = req.body;
  
  console.log(`\n==================================================`);
  console.log(`🚀 [SPECLANE INQUIRY RECEIVED & SAVING TO DB]`);
  console.log(`==================================================`);
  console.log(`👤 Name:         ${name}`);
  console.log(`📧 Work Email:   ${email}`);
  console.log(`🏢 Company:      ${company}`);
  console.log(`🏷️  Inquiry Type: ${inquiryType}`);
  console.log(`💬 Message:      ${message}`);
  console.log(`==================================================\n`);

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        name,
        email,
        company,
        inquiry_type: inquiryType || 'sales',
        message,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const savedInquiry: Inquiry = {
      id: data.id,
      name: data.name,
      email: data.email,
      company: data.company,
      inquiryType: data.inquiry_type,
      message: data.message,
      createdAt: data.created_at,
      status: data.status
    };

    return res.status(200).json({
      success: true,
      inquiry: savedInquiry,
      message: "Inquiry saved to database successfully."
    });
  } catch (err: any) {
    console.warn('Failed to insert into Supabase "inquiries" table. Falling back to in-memory.', err.message);
    
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      name,
      email,
      company,
      inquiryType: inquiryType || 'sales',
      message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    FALLBACK_DB.unshift(newInquiry);

    return res.status(200).json({
      success: true,
      inquiry: newInquiry,
      message: "Inquiry saved locally (fallback)."
    });
  }
});

// Super Admin CRM Update Endpoint
router.patch('/:id', authenticate, verifySuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (id.startsWith('inq-')) {
      const inquiry = FALLBACK_DB.find(i => i.id === id);
      if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
      if (status) inquiry.status = status;
      return res.json(inquiry);
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedInquiry: Inquiry = {
      id: data.id,
      name: data.name,
      email: data.email,
      company: data.company,
      inquiryType: data.inquiry_type,
      message: data.message,
      createdAt: data.created_at,
      status: data.status
    };

    res.json(updatedInquiry);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status in DB' });
  }
});

export default router;
