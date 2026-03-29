'use client';

import Image from 'next/image';

export function PostPreview({ formData }: { formData: any }) {
  const image = formData.images?.[0];

  return (
    <div className="w-full max-w-sm bg-white rounded-[20px] shadow p-4">
      {/* IMAGE */}
      <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-100 mb-3">
        {image && <Image src={image} alt="preview" fill className="object-cover" />}
      </div>

      {/* CAPTION */}
      <p className="text-sm whitespace-pre-line">{formData.caption || 'Your caption will appear here...'}</p>

      {/* META */}
      <div className="text-xs text-muted-foreground mt-2">
        {formData.platform} • {formData.postType}
      </div>
    </div>
  );
}
