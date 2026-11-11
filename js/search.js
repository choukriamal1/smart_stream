export const recherche = (channels, text)=>{
    const search = text.toLowerCase().trim();
    return channels.filter((channel)=>
    channel.name.toLowerCase().includes(search));
};
