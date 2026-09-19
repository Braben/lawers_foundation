export function videoSource(value:string): { kind:'embed'|'file'; src:string } | null {
  try {
    const url=new URL(value);
    if (url.protocol!=='https:' || url.username || url.password) return null;
    const host=url.hostname.toLowerCase();
    if (['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)) {
      const parts=url.pathname.split('/').filter(Boolean);
      const id=host==='youtu.be'?parts[0]:url.searchParams.get('v') || (['embed','shorts','live'].includes(parts[0])?parts[1]:'');
      return id && /^[\w-]{11}$/.test(id)?{kind:'embed',src:`https://www.youtube-nocookie.com/embed/${id}`}:null;
    }
    if (['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)) {
      const parts=url.pathname.split('/').filter(Boolean);
      const id=parts[0]==='video'?parts[1]:parts[0];
      const hash=url.searchParams.get('h') || (parts[0]!=='video'?parts[1]:'');
      if (!/^\d+$/.test(id || '')) return null;
      return {kind:'embed',src:`https://player.vimeo.com/video/${id}${hash && /^[a-zA-Z0-9]+$/.test(hash)?'?h='+hash:''}`};
    }
    if (/\.(mp4|webm)$/i.test(url.pathname)) return {kind:'file',src:url.href};
  } catch {}
  return null;
}
