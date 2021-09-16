import React, { StrictMode } from "react"

import {
  Button,
  Flex,
  Text,
  Box,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react"
import { observer, useLocalObservable } from "mobx-react-lite"

interface IComponentProps {
  isOpen?: any
  onClose: any
  confrimDeviceSuccess: (privateKey: string, imei: string) => void
}

export const ConfrimDevice = observer((props: IComponentProps) => {
  const { isOpen, onClose, confrimDeviceSuccess } = props
  const color = useColorModeValue("#000000D9", "white")
  const store = useLocalObservable(() => ({
    buttonDisable: true,
    imei: "",
    privateKey: "",
    colseModal() {
      store.reset()
      onClose()
    },
    reset() {
      store.privateKey = ""
      store.imei = ""
    },
    next() {
      confrimDeviceSuccess(store.privateKey, store.imei)
      onClose()
    },
    onInputChange(e: any, inputType: number) {
      if (inputType === 0) {
        store.imei = e.target.value
      }
      if (inputType === 1) {
        store.privateKey = e.target.value
      }

      store.buttonEnable()
    },

    buttonEnable() {
      store.buttonDisable = !(store.privateKey.length > 0 && store.imei.length > 0)
    },
  }))

  return (
    <Modal
      motionPreset="slideInBottom"
      onClose={store.colseModal}
      isOpen={isOpen}
      size="xl"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent w={{ base: "90%", md: "100%" }}>
        <ModalHeader borderBottom="1px" borderColor="borderLight">
          Configure your Device
        </ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody py="1.25rem" color="textPrimary" fontFamily="Roboto">
          <Box color={color}>
            <Flex
              mt="15px"
              alignItems={["flex-start", "center"]}
              mb="3"
              direction={["column", "row"]}
            >
              <Text fontSize="sm" w="200px" mb={[2, 0]}>
                Device IMEI
              </Text>
              <Input
                onChange={(e) => {
                  store.onInputChange(e, 0)
                }}
                value={store.imei}
                placeholder={"IMEI"}
                size="sm"
              />
            </Flex>
            <Flex
              mt="15px"
              alignItems={["flex-start", "center"]}
              mb="3"
              direction={["column", "row"]}
            >
              <Text fontSize="sm" w="200px" mb={[2, 0]}>
                Device Private Key
              </Text>
              <Input
                onChange={(e) => {
                  store.onInputChange(e, 1)
                }}
                value={store.privateKey}
                placeholder={"PrivateKey"}
                size="sm"
              />
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter borderTop="1px" borderColor="borderLight">
          <Button
            size="sm"
            onClick={store.colseModal}
            mr="0.5rem"
            bg="transparent"
            border="1px"
            borderColor="borderBtn"
          >
            Cancel
          </Button>
          <Button
            w="62px"
            size="sm"
            onClick={() => store.next()}
            disabled={store.buttonDisable}
            color="lightColor"
            bg="brandColor"
          >
            Next
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
