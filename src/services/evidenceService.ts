import { supabase } from '@/supabaseClient';

export type EvidenceType = 'photo' | 'video' | 'audio' | 'text';

export interface EvidenceItemToUpload {
  id: string;
  type: EvidenceType;
  file?: File;
  description?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface UploadEvidenceParams {
  orderId: string;
  technicianId: string;
  title: string;
  note?: string;
  items: EvidenceItemToUpload[];
  stage: 'in_transit' | 'arrived' | 'installing' | 'operation_completed';
}

export const evidenceService = {
  async uploadEvidence(params: UploadEvidenceParams): Promise<{ success: boolean; uploaded: number; errors: number }>{
    const { orderId, technicianId, title, note, items, stage } = params;
    let uploaded = 0;
    let errors = 0;
    const groupId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const newStoragePaths: string[] = [];
    const newFileUrls: string[] = [];

    // Subir archivos (fotos/videos)
    for (const item of items) {
      try {
        if (!item.file) throw new Error('Archivo no disponible');
        const ext = item.file.name.split('.').pop() || 'bin';
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `${orderId}/${technicianId}/${groupId}/${filename}`;

        // Subir a Storage (bucket: evidence)
        const { error: uploadError } = await supabase.storage.from('evidence').upload(path, item.file, {
          upsert: true,
          cacheControl: '3600',
        });
        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: publicUrl } = supabase.storage.from('evidence').getPublicUrl(path);
        const fileUrl = publicUrl.publicUrl;

        newStoragePaths.push(path);
        newFileUrls.push(fileUrl);

        uploaded += 1;
      } catch (e) {
        console.error('Error subiendo evidencia:', e);
        errors += 1;
      }
    }

    // Persistir en una sola fila por etapa: insert o update (append)
    try {
      // Intentar seleccionar existente
      const { data: existing, error: selError } = await supabase
        .from('Evidence')
        .select('id, storage_path, file_url')
        .eq('order_id', orderId)
        .eq('technician_id', technicianId)
        .eq('stage', stage)
        .maybeSingle();

      if (selError) throw selError;

      if (!existing) {
        const insertPayload: any = {
          order_id: orderId,
          technician_id: technicianId,
          title,
          note: note || null,
          type: 'photo',
          storage_path: newStoragePaths,
          file_url: newFileUrls,
          group_id: groupId,
          stage,
        };
        const { error: insError } = await supabase.from('Evidence').insert(insertPayload);
        if (insError) throw insError;
      } else {
        const prevPaths: string[] = (existing as any).storage_path || [];
        const prevUrls: string[] = (existing as any).file_url || [];
        const updPayload: any = {
          storage_path: [...prevPaths, ...newStoragePaths],
          file_url: [...prevUrls, ...newFileUrls],
          title, // opcional: actualizar título/nota
          note: note || null,
        };
        const { error: updError } = await supabase
          .from('Evidence')
          .update(updPayload)
          .eq('id', (existing as any).id);
        if (updError) throw updError;
      }
    } catch (e) {
      console.error('Error persistiendo Evidence:', e);
      errors += 1;
    }

    return { success: errors === 0, uploaded, errors };
  },
};



