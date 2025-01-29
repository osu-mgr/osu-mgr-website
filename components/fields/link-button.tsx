import { title } from "process";
import React, { useState, useEffect } from "react";
import { wrapFieldsWithMeta, InputProps, TinaAdminApi, useCMS } from "tinacms";

export const LinkButtonInput = wrapFieldsWithMeta<InputProps>(({ input, meta }) => {
  const cms = useCMS();
  const api = new TinaAdminApi(cms);
  const [pageExists, setPageExists] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      console.log("Checking if authenticated");
      if (api.isAuthenticated()) {
        console.log("Checking if page exists", `${input.value}.mdx`);
        try {
          await api.fetchDocument("page", `${input.value}.mdx`);
          console.log("Page exists");
          setPageExists(true);
        } catch (error) {
          console.log("Page does not exist", error);
          setPageExists(false);
        }
      }
    })();
  }, [input.value]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <input
          name="link"
          id="link"
          type="text"
          className="shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md"
          {...input}
        />
        {meta.pristine && pageExists &&
          <a
            href={`#/~/${input.value}`}
            role="button"
            className="btn btn-disabled bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Edit
          </a>
        }
        {meta.pristine && !pageExists &&
          <a
            role="button"
            className="btn btn-disabled bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={async () => {
              if (api.isAuthenticated()) {
                  try {
                    await api.createDocument(api.schema.getCollection("page"), `${input.value}.mdx`, api.schema.transformPayload("page", {
                      _collection: "page",
                      title: input.value,
                    }));
                    setPageExists(true);
                  } catch (error) {
                    throw new Error(
                      `[${error.name}] CreateDocument failed: ${error.message}`
                    )
                  }
                }
              }
            }
          >
            Create
          </a>
        }
      </div>
    </>
  );
});
