import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN || 'ckrevwqcqfrqitjcswri',
  region: process.env.REACT_APP_NHOST_REGION || 'ap-south-1'
})

export { nhost }