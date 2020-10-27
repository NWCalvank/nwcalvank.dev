import React from "react"
import Image from "gatsby-image"
import { useStaticQuery, graphql } from "gatsby"

const SocialIcon = props => (
  <a
    style={{
      boxShadow: `none`,
    }}
    href={props.href}
    target="_blank"
    rel="noreferrer"
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
        href={`https://github.com/${social.github}`}
        alt="NWCalvank Github"
      />
      <SocialIcon
        icon={data.linkedin.childImageSharp.fixed}
        href={`https://linkedin.com/in/${social.linkedin}`}
        alt="NWCalvank LinkedIn"
      />
      <SocialIcon
        icon={data.instagram.childImageSharp.fixed}
        href={`https://instagram.com/${social.instagram}`}
        alt="NWCalvank Instagram"
      />
      <SocialIcon
        icon={data.youtube.childImageSharp.fixed}
        href={`https://youtube.com/c/${social.youtube}`}
        alt="NWCalvank YouTube"
      />
    </footer>
  )
}
