import {
   S3Client,
   PutObjectCommand,
   GetObjectCommand,
   ListObjectsV2Command,
   DeleteObjectCommand,
   DeleteObjectsCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html

const client = new S3Client({ region: 'us-east-1' })
const Bucket = process.env.S3_ITEMS_BUCKET
const filesBucket = process.env.S3_FILES_BUCKET

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

export const deleteReceiptPictureFromOrderS3Bucket = async (key) => {
   try {
      const data = await client.send(
         new DeleteObjectCommand({
            Bucket: fileBucket,
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

export const uploadToFilesS3Bucket = async (object, key) => {
   try {
      let Key = `${key}/deliveryFile.jpg`
      const data = await client.send(
         new PutObjectCommand({
            Bucket: filesBucket,
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

export const getPictureFromFilesS3Bucket = async (key) => {
   try {
      const Key = `${key}/deliveryFile.jpg`
      const command = new GetObjectCommand({
         Bucket: filesBucket,
         Key,
      })
      const url = await getSignedUrl(client, command, { expiresIn: 3600 })
      return url
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
      // console.log(data)
      return data
   } catch (error) {
      //   console.log(error)
      const { requestId, cfId, extendedRequestId } = error.$metadata
      console.log({ requestId, cfId, extendedRequestId })
   }
}
