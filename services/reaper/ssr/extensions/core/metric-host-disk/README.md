# metric-host-disk

Measure mounted disk stats.

**NOTE:** this metric missbehave when running the reaper as Docker image!
_(that's because it will see the mounted disks inside the container, not the host's)_

## Configuration

Set the scraper velocity with:

    METRIC_HOST_DISK_INTERVAL=5000

Filter specific disks by mount point:

    METRIC_HOST_DISK_FILTER=/;/mnt/my-data-vol;/db-disk

## Collected Data

Data is expressed in kylobytes.

    {
        "/": {
            "fs": "/dev/disk1s1",
            "free": "204710580",
            "used": "278632832",
            "mount": "/",
            "total": "488245288",
            "usage": "58%"
        },
        "/Volumes/Install": {
            "fs": "/dev/disk2s1",
            "free": "160832",
            "used": "288152",
            "mount": "/Volumes/Install",
            "total": "448984",
            "usage": "65%"
        }
    }
