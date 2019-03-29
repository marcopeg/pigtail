import { createPigtailClient } from '@pigtail/buffer'

export default async () => {
    console.log('BOOT')
    pigtail = createPigtailClient()
    console.log(pigtail)
    
}