export async function getMediaId(url : string, accessToken: string): Promise<string> {
    const imageRes = await fetch(url);
    const imageBlob = await imageRes.blob();
    
    const formData = new FormData();
    formData.append("media", imageBlob);

    // ADD THIS LINE: Required by the v2 media upload endpoint
    formData.append("media_category", "tweet_image"); 
    
    // Optional but recommended: Specify the media type
    formData.append("media_type", imageBlob.type || "image/jpeg");

    const uploadRes = await fetch("https://api.x.com/2/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
    });

    if(!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.log("Twitter media upload error:", errorText);
        throw { message: 'Failed to upload media to Twitter', status: uploadRes.status };
    }

    const uploadData = await uploadRes.json();
    console.log("Twitter media upload response:", uploadData);
    return uploadData.data.id; // Return the specific Media ID
}