import {
   S3Client,
   PutObjectCommand,
   ListObjectsV2Command,
   DeleteObjectCommand,
   DeleteObjectsCommand,
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html

const client = new S3Client({ region: 'us-east-1' })
const Bucket = process.env.S3_ITEMS_BUCKET

export const deleteItemPictures = async (item) => {
   try {
      const response = await client.send(
         new ListObjectsV2Command({
            Bucket,
            Prefix: `${item}/`,
         })
      )
      //   console.log(keysToDelete)
      let keysToDelete
      if (response.Contents) {
         keysToDelete = response.Contents.map((x) => ({ Key: x.Key }))
         //  console.log(keysToDelete)
         const data = await client.send(
            new DeleteObjectsCommand({
               Bucket,
               Delete: { Objects: keysToDelete },
            })
         )
         //  console.log(data)
      }

      return keysToDelete
   } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata
      console.log({ requestId, cfId, extendedRequestId })
   }
}

export const deletePictureFromItemS3Bucket = async (key) => {
   try {
      const data = await client.send(
         new DeleteObjectCommand({
            Bucket,
            Key: key,
         })
      )
      return data
   } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata
      console.log({ requestId, cfId, extendedRequestId })
   }
}

export const uploadToItemsS3Bucket = async (object, key) => {
   try {
      let Key = `${key}/${uuidv4()}.jpg`
      const data = await client.send(
         new PutObjectCommand({
            Bucket,
            Key,
            Body: object,
         })
      )
      return Key
   } catch (error) {
      const { requestId, cfId, extendedRequestId } = error.$metadata
      console.log({ requestId, cfId, extendedRequestId })
   }
}

export const getItemImagesFromS3Bucket = async (key) => {
   try {
      const data = await client.send(
         new ListObjectsV2Command({
            Bucket,
            Prefix: `${key}/`,
         })
      )
      //   console.log(data)
      return data
   } catch (error) {
      //   console.log(error)
      const { requestId, cfId, extendedRequestId } = error.$metadata
      console.log({ requestId, cfId, extendedRequestId })
   }
}
