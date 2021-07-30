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
import { observer, useLocalStore } from "mobx-react-lite"

interface IComponentProps {
  isOpen?: any
  onClose: any
  onInputPrivateKeySuccess: (string) => void
}

export const InputPrivateKeyDialog = observer((props: IComponentProps) => {
  const { isOpen, onClose, onInputPrivateKeySuccess } = props
  const color = useColorModeValue("#000000D9", "white")
  const store = useLocalStore(() => ({
    buttonDisable: true,
    privateKey: "af014862975162497bced9988518955bdc372fc3f545c25c9bf315f5c3b3c82a",
    colseModal() {
      store.reset()
      onClose()
    },
    reset() {
      store.privateKey = ""
    },
    next() {
      onInputPrivateKeySuccess(store.privateKey)

      onClose()
    },
    onInputChange(e: any, inputType: number) {
      if (inputType === 1) {
        store.privateKey = e.target.value
      }

      store.buttonEnable()
    },

    buttonEnable() {
      store.buttonDisable = !(store.privateKey.length > 0)
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
          Input Device PrivateKey
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
              <Text fontSize="sm" w="140px" mb={[2, 0]}>
                Device PrivateKey
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
