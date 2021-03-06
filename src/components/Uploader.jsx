import React, { useState, useContext } from 'react'
import context from '../stores/index'
import { observer } from 'mobx-react'
import { Upload, Modal, message, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
  UploaderWrapper,
  UploadResultHeader,
  UploadResult,
  UploadResultLine,
  Copy,
} from './Styled'

const Component = observer(() => {
  const { ImageStore, UserStore } = useContext(context)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [fileList, setFilelist] = useState([])

  let onCancel = () => setPreviewVisible(false)
  let onPreview = (file) => {
    setPreviewImage(file.url)
    setPreviewVisible(true)
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
    )
  }
  let onRemove = (file) => {
    setFilelist(fileList.filter((v) => v !== file))
  }

  // let customRequest = async ({ file }) => {
  //   ImageStore.setFile(file);
  //   ImageStore.setName(file.name);
  //   if (!UserStore.currentUser) {
  //     message.error("请先登录再上传");
  //     return;
  //   }
  //   try {
  //     let img = await ImageStore.upload();
  //     setFilelist((fileList) => [
  //       ...fileList,
  //       {
  //         uid: file.uid,
  //         name: file.name,
  //         status: "done",
  //         url: img.attributes.attachments[0].attributes.url,
  //       },
  //     ]);
  //     console.log("文件上传成功");
  //   } catch (err) {
  //     setFilelist((fileList) => [
  //       ...fileList,
  //       {
  //         uid: file.uid,
  //         name: file.name,
  //         status: "error",
  //       },
  //     ]);
  //     console.log("文件上传失败", err);
  //   }
  // };
  let customRequest = ({ file }) => {
    ImageStore.setFile(file)
    ImageStore.setName(file.name)
    if (!UserStore.currentUser) {
      message.error('请先登录再上传')
      return
    }
    if (!/^(image\/)/i.test(file.type)) {
      message.error('请上传一张或多张任意类型图片')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      message.error('单张图片体积应小于100M')
      return
    }
    ImageStore.upload().then(
      (img) => {
        setFilelist((fileList) => [
          ...fileList,
          {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: img.attributes.attachments[0].attributes.url,
            width: '',
            height: '',
            fullurl: '',
          },
        ])
        message.success('文件上传成功')
      },
      (err) => {
        setFilelist((fileList) => [
          ...fileList,
          {
            uid: file.uid,
            name: file.name,
            status: 'error',
          },
        ])
        message.error('文件上传失败')
        console.log('文件上传失败', err)
      }
    )
  }
  let handleWidth = (e, file) => {
    file.width = isNaN(e.target.value) ? '' : e.target.value
    file.fullurl =
      file.url +
      (file.width === '' && file.height === '' ? '' : '?/imageview2/0') +
      (file.width !== '' ? `/w/${file.width}` : '') +
      (file.height !== '' ? `/h/${file.height}` : '')
    setFilelist([...fileList])
  }
  let handleHeight = (e, file) => {
    file.height = isNaN(e.target.value) ? '' : e.target.value
    file.fullurl =
      file.url +
      (file.width === '' && file.height === '' ? '' : '?/imageview2/0') +
      (file.width !== '' ? `/w/${file.width}` : '') +
      (file.height !== '' ? `/h/${file.height}` : '')
    setFilelist([...fileList])
  }
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>多文件上传</div>
    </div>
  )
  return (
    <UploaderWrapper>
      <Spin spinning={ImageStore.isUploading} size="large" tip="图片正在上传中">
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={onPreview}
          onRemove={onRemove}
          customRequest={customRequest}
          multiple={true}
        >
          {uploadButton}
        </Upload>
        {fileList.length === 0 ? null : (
          <>
            <UploadResultHeader>上传结果</UploadResultHeader>
            <UploadResult>
              {fileList.map((file) => (
                <UploadResultLine key={file.uid}>
                  <a
                    href={file.fullurl || file.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file.name}
                  </a>
                  <input
                    onChange={(e) => handleWidth(e, file)}
                    placeholder="设置宽度：默认"
                  />
                  <input
                    onChange={(e) => handleHeight(e, file)}
                    placeholder="设置长度：默认"
                  />
                  <Copy
                    onClick={(e) => {
                      if (file.url) {
                        navigator.clipboard.writeText(file.fullurl || file.url)
                        e.target.innerText = '(链接已复制)'
                      } else {
                        navigator.clipboard.writeText(file.name)
                        e.target.innerText = '(名称已复制)'
                      }
                      if (
                        !e.target.className
                          .toString()
                          .split(' ')
                          .includes('active')
                      ) {
                        e.target.className += ' active'
                      }
                    }}
                  >
                    {file.url ? '点击复制链接' : '点击复制名称'}
                  </Copy>
                </UploadResultLine>
              ))}
            </UploadResult>
          </>
        )}
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={onCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
    </UploaderWrapper>
  )
})

export default Component
