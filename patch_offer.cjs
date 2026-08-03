const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/EmployeeProfile.tsx', 'utf8');

const target = `  const handleOfferFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !employeeId) return
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      hrToast.error('Invalid File', 'Please upload a PDF file.')
      if (e.target) e.target.value = ''
      return
    }

    setSendingOffer(true)
    try {
      const db = await getDatabase()
      const storage = await getStorage()
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
      
      const uniqueFilename = \`\${Date.now()}-\${file.name}\`
      const fileRef = storageRef(storage, \`tenants/\${tenantId}/offerletters/\${employeeId}/\${uniqueFilename}\`)
      await uploadBytes(fileRef, file)
      const downloadUrl = await getDownloadURL(fileRef)
      
      const offerData: OfferLetter = {
        id: \`offer-\${Date.now()}\`,
        employeeId,
        employeeName: profile?.name || '',
        sent: true,
        date: new Date().toISOString().split('T')[0],
        url: downloadUrl,
      }
      await (db as any).set(\`tenants/\${tenantId}/OfferLetters/\${offerData.id}\`, offerData)
      hrToast.success('Offer Letter Sent', 'Offer letter sent to employee successfully')
    } catch (error: any) {
      hrToast.error('Send Failed', error?.message || 'Unable to send offer letter')
    } finally {
      setSendingOffer(false)
      if (e.target) e.target.value = ''
    }
  }`;

const replacement = `  const handleOfferFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !employeeId) return
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      hrToast.error('Invalid File', 'Please upload a PDF file.')
      if (e.target) e.target.value = ''
      return
    }

    setSendingOffer(true)
    try {
      const db = await getDatabase()
      const storage = await getStorage()
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
      
      const uniqueFilename = \`\${Date.now()}-\${file.name}\`
      const fileRef = storageRef(storage, \`tenants/\${tenantId}/offerletters/\${employeeId}/\${uniqueFilename}\`)
      await uploadBytes(fileRef, file)
      const downloadUrl = await getDownloadURL(fileRef)
      
      const offerSnap = await (db as any).get(\`tenants/\${tenantId}/OfferLetters\`)
      const existingOffersData = offerSnap.val() as Record<string, OfferLetter> | null
      
      if (existingOffersData) {
        const existingOffers = Object.values(existingOffersData).filter((o: any) => o.employeeId === employeeId)
        for (const offer of existingOffers) {
          if (offer.id) {
            await (db as any).remove(\`tenants/\${tenantId}/OfferLetters/\${offer.id}\`)
          }
        }
      }

      const offerData: OfferLetter = {
        id: \`offer-\${employeeId}\`,
        employeeId,
        employeeName: profile?.name || '',
        sent: true,
        date: new Date().toISOString().split('T')[0],
        url: downloadUrl,
      }
      await (db as any).set(\`tenants/\${tenantId}/OfferLetters/\${offerData.id}\`, offerData)
      setOfferLetter(offerData)
      hrToast.success('Offer Letter Sent', 'Offer letter sent to employee successfully')
    } catch (error: any) {
      hrToast.error('Send Failed', error?.message || 'Unable to send offer letter')
    } finally {
      setSendingOffer(false)
      if (e.target) e.target.value = ''
    }
  }`;

if (code.includes('const file = e.target.files?.[0]')) {
  // Try simple replace
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/EmployeeProfile.tsx', code);
  console.log("Patched successfully via exact match.");
} else {
  console.log("Could not find exact match. Manual replace needed.");
}
