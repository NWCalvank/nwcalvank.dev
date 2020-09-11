import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default () => {
  const data = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          social {
            github
            instagram
            linkedin
          }
        }
      }
    }
  `)
  const { social } = data.site.siteMetadata

  return (
    <footer>
      <a href={`https://github.com/${social.github}`}>github</a> |{" "}
      <a href={`https://linkedin.com/${social.linkedin}`}>linkedin</a> |{" "}
      <a href={`https://instagram.com/${social.instagram}`}>instagram</a>
    </footer>
  )
}
