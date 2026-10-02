import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateScreenshotName } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const member_id = formData.get('member_id') as string;
    const model_id = formData.get('model_id') as string;
    const step_number = parseInt(formData.get('step_number') as string, 10);
    const step_name = formData.get('step_name') as string;

    if (!file || !member_id || !model_id || isNaN(step_number) || !step_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file_name = generateScreenshotName(model_id, step_number, step_name);

    // Upload to Pinata
    const formDataForPinata = new FormData();
    formDataForPinata.append('file', file);
    formDataForPinata.append('network', 'public');

    const pinataRes = await fetch('https://uploads.pinata.cloud/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formDataForPinata,
    });

    if (!pinataRes.ok) {
      const err = await pinataRes.text();
      console.error('Pinata upload failed:', err);
      return NextResponse.json({ error: 'Failed to upload file to Pinata' }, { status: 500 });
    }

    const pinataData = await pinataRes.json();
    const cid = pinataData.data.cid;
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    const pinata_url = `https://${gateway}/ipfs/${cid}`;

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('screenshots')
      .upsert({
        member_id,
        model_name: model_id,
        step_id: step_number,
        step_name,
        file_name,
        pinata_url,
        pinata_cid: cid,
      }, { onConflict: 'member_id,step_id' });

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: pinata_url,
      file_name
    });

  } catch (error: unknown) {
    console.error('Upload handler error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
