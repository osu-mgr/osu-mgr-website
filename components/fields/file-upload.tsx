import * as React from "react";
import { useCMS, Media, wrapFieldsWithMeta, InputProps, ImageUpload  } from "tinacms";
import { useState } from 'react';
import { FileError } from 'react-dropzone';

interface FileUploadProps {
  path: string
  uploadDir?(formValues: any): string
  clearable?: boolean
}

export const FileUpload = wrapFieldsWithMeta<InputProps, FileUploadProps>(
  (props) => {
    const ref = React.useRef(null)
    const cms = useCMS()
    const { value } = props.input
    const src = value
    const [isUploading, setIsUploading] = useState(false)
    let onClear: any
    if (props.field.clearable) {
      onClear = () => props.input.onChange('')
    }

    React.useEffect(() => {
      if (ref.current && props.field.experimental_focusIntent) {
        ref.current.focus()
      }
    }, [props.field.experimental_focusIntent, ref])

    async function onChange(media?: Media | Media[]) {
      if (media) {
        props.input.onChange(media)
      }
    }
    const uploadDir = props.field.uploadDir || (() => '')

    return (
      <ImageUpload
        ref={ref}
        value={value}
        src={src}
        loading={isUploading}
        onClick={() => {
          const directory = uploadDir(props.form.getState().values)
          cms.media.open({
            allowDelete: true,
            directory,
            onSelect: onChange,
          })
        }}
        onDrop={async ([file]: File[], fileRejections) => {
          setIsUploading(true)
          try {
            if (file) {
              const directory = uploadDir(props.form.getState().values)
              const [media] = await cms.media.persist([
                {
                  directory: directory,
                  file,
                },
              ])
              if (media) {
                await onChange(media)
              }
            }

            // Codes here https://github.com/react-dropzone/react-dropzone/blob/c36ab5bd8b8fd74e2074290d80e3ecb93d26b014/typings/react-dropzone.d.ts#LL13-L18C2
            const errorCodes = {
              'file-invalid-type': 'Invalid file type',
              'file-too-large': 'File too large',
              'file-too-small': 'File too small',
              'too-many-files': 'Too many files',
            }

            const printError = (error: FileError) => {
              const message = errorCodes[error.code]
              if (message) {
                return message
              }
              console.error(error)
              return 'Unknown error'
            }

            // Upload Failed
            if (fileRejections.length > 0) {
              const messages = []
              fileRejections.map((fileRejection) => {
                messages.push(
                  `${fileRejection.file.name}: ${fileRejection.errors
                    .map((error) => printError(error))
                    .join(', ')}`
                )
              })
              cms.alerts.error(() => {
                return (
                  <>
                    Upload Failed. <br />
                    {messages.join('. ')}.
                  </>
                )
              })
            }
          } catch (error) {
            console.error('Error uploading media asset: ', error)
          } finally {
            setIsUploading(false)
          }
        }}
        onClear={onClear}
      />
    )
  }
)

export const fileUploadSchema = {
  name: 'file_upload',
  Component: FileUpload,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}