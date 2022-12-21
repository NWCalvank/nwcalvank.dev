import React from "react"

const Podcast = () => {
  return (
    <>
      <h1>Latest Podcast Episode</h1>
      <div
        style={{
          display: `flex`,
        }}
      >
        <iframe
          style={{ "border-radius": "12px" }}
          src="https://open.spotify.com/embed/show/5Z0Nuyrg1QeGYfTQLnWDSq?utm_source=generator&theme=0"
          width="100%"
          height="152"
          frameBorder="0"
          allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </>
  )
}

export default Podcast
