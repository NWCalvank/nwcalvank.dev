import React from "react"
import Image from "gatsby-image"
import { useStaticQuery, graphql } from "gatsby"

const SocialIcon = props => (
  <a
    style={{
      boxShadow: `none`,
    }}
    href={`https://github.com/${props.username}`}
  >
    <Image
      fixed={props.icon}
      alt={props.alt}
      style={{
        marginLeft: 7,
        marginRight: 7,
      }}
    />
  </a>
)

export default () => {
  const data = useStaticQuery(graphql`
    query FooterQuery {
      github: file(absolutePath: { regex: "/light/GitHub-Mark-64px.png/" }) {
        childImageSharp {
          fixed(height: 32) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      linkedin: file(
        absolutePath: { regex: "/light/linkedin-logo-black.png/" }
      ) {
        childImageSharp {
          fixed(height: 32) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      instagram: file(absolutePath: { regex: "/light/instagram-logo.png/" }) {
        childImageSharp {
          fixed(height: 32) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      youtube: file(absolutePath: { regex: "/light/yt_icon_mono_light.png/" }) {
        childImageSharp {
          fixed(height: 32) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          social {
            github
            instagram
            linkedin
            youtube
          }
        }
      }
    }
  `)
  const { social } = data.site.siteMetadata

  return (
    <footer>
      <SocialIcon
        icon={data.github.childImageSharp.fixed}
        username={social.github}
        alt="NWCalvank Github"
      />
      <SocialIcon
        icon={data.linkedin.childImageSharp.fixed}
        username={social.linkedin}
        alt="NWCalvank LinkedIn"
      />
      <SocialIcon
        icon={data.instagram.childImageSharp.fixed}
        username={social.instagram}
        alt="NWCalvank Instagram"
      />
      <SocialIcon
        icon={data.youtube.childImageSharp.fixed}
        username={social.youtube}
        alt="NWCalvank YouTube"
      />
    </footer>
  )
}
