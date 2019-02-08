# metric-host-fsize

Measure folder sizes of a list of targets

## Configuration

Set the scraper velocity with:

    METRIC_HOST_FSIZE_INTERVAL=5000

## Run With NodeJS

Provide a list of target folders to monitor:

    METRIC_HOST_FSIZE_TARGETS=/Users/foo/target1::f1;/Users/foo/target2

The list uses `;` as separator.  
Each target can define an alias as `::alias-name`.

The data structure that is saved as metric will contain folder sizes in kilobytes
for each target using either the alias or the target path as key:

    {
        f1: 67888,
        `/Users/foo/target2`: 455555
    }

## Run With Docker

The daemon will measure and report any subfolder of:

    /var/lib/rapha/fsize

Mount your targets as subfolders:

    -v /Users/foo/target1:/var/lib/rapha/fsize/f1 \
    -v /Users/foo/target2:/var/lib/rapha/fsize/target2

The folder name will be used as alias:

    {
        f1: 67888,
        f2: 455555
    }
